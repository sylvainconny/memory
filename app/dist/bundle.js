var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const fruits = [
      "pomme-rouge",
      "banane",
      "orange",
      "citron-vert",
      "grenade",
      "abricot",
      "citron",
      "fraise",
      "pomme-verte",
      "peche",
      "raisin",
      "pasteque",
      "prune",
      "poire",
      "cerise",
      "framboise",
      "mangue",
      "cerise-bigarreau",
    ];

    const tailleImage = 1800;
    const tailleFruit = 100;

    /* src/components/Fruit.svelte generated by Svelte v3.44.2 */
    const file$6 = "src/components/Fruit.svelte";

    function create_fragment$6(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "mx-auto svelte-1w7vj73");
    			if (!src_url_equal(img.src, img_src_value = "/app/public/cards.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = fruits[/*indexFruit*/ ctx[0]]);
    			attr_dev(img, "style", `object-position: 0px ${/*positionFruitPourcent*/ ctx[1]}%;`);
    			add_location(img, file$6, 18, 0, 663);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*indexFruit*/ 1 && img_alt_value !== (img_alt_value = fruits[/*indexFruit*/ ctx[0]])) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fruit', slots, []);
    	let { indexFruit } = $$props;

    	// on fait en sorte que l'index ne dépasse le nombre de fruits
    	// on ne soit négatif
    	indexFruit = Math.min(Math.abs(indexFruit), fruits.length - 1);

    	// on calcule la position du dernier fruit
    	const positionDernierFruit = tailleImage - tailleFruit;

    	// on calcule la position du fruit selectionné
    	const positionFruit = indexFruit * tailleFruit;

    	// on calcule la position du fruit selectionné en pourcentage
    	// par rapport à la position du dernier fruit
    	const positionFruitPourcent = positionFruit / positionDernierFruit * 100;

    	const writable_props = ['indexFruit'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fruit> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('indexFruit' in $$props) $$invalidate(0, indexFruit = $$props.indexFruit);
    	};

    	$$self.$capture_state = () => ({
    		fruits,
    		tailleFruit,
    		tailleImage,
    		indexFruit,
    		positionDernierFruit,
    		positionFruit,
    		positionFruitPourcent
    	});

    	$$self.$inject_state = $$props => {
    		if ('indexFruit' in $$props) $$invalidate(0, indexFruit = $$props.indexFruit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [indexFruit, positionFruitPourcent];
    }

    class Fruit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { indexFruit: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fruit",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*indexFruit*/ ctx[0] === undefined && !('indexFruit' in props)) {
    			console.warn("<Fruit> was created without expected prop 'indexFruit'");
    		}
    	}

    	get indexFruit() {
    		throw new Error("<Fruit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indexFruit(value) {
    		throw new Error("<Fruit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Icone.svelte generated by Svelte v3.44.2 */

    const file$5 = "src/components/Icone.svelte";

    // (5:0) {#if nom == "question-circle"}
    function create_if_block$3(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z");
    			add_location(path0, file$5, 11, 4, 213);
    			attr_dev(path1, "d", "M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z");
    			add_location(path1, file$5, 14, 4, 310);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "currentColor");
    			attr_dev(svg, "class", "bi bi-question-circle mx-auto svelte-1yg9fua");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			add_location(svg, file$5, 5, 2, 71);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(5:0) {#if nom == \\\"question-circle\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*nom*/ ctx[0] == "question-circle" && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*nom*/ ctx[0] == "question-circle") {
    				if (if_block) ; else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icone', slots, []);
    	let { nom } = $$props;
    	const writable_props = ['nom'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icone> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('nom' in $$props) $$invalidate(0, nom = $$props.nom);
    	};

    	$$self.$capture_state = () => ({ nom });

    	$$self.$inject_state = $$props => {
    		if ('nom' in $$props) $$invalidate(0, nom = $$props.nom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nom];
    }

    class Icone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { nom: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icone",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nom*/ ctx[0] === undefined && !('nom' in props)) {
    			console.warn("<Icone> was created without expected prop 'nom'");
    		}
    	}

    	get nom() {
    		throw new Error("<Icone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nom(value) {
    		throw new Error("<Icone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Carte.svelte generated by Svelte v3.44.2 */
    const file$4 = "src/components/Carte.svelte";

    // (18:0) {#if carte}
    function create_if_block$2(ctx) {
    	let a;
    	let div4;
    	let div1;
    	let div0;
    	let icone;
    	let t;
    	let div3;
    	let div2;
    	let fruit;
    	let a_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	icone = new Icone({
    			props: { nom: "question-circle" },
    			$$inline: true
    		});

    	fruit = new Fruit({
    			props: { indexFruit: /*carte*/ ctx[0].indexFruit },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(icone.$$.fragment);
    			t = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(fruit.$$.fragment);
    			attr_dev(div0, "class", "p-3 h-100 align-items-center d-flex");
    			add_location(div0, file$4, 25, 8, 686);
    			attr_dev(div1, "class", "carte-avant bg-primary text-light svelte-4nlqkh");
    			add_location(div1, file$4, 24, 6, 630);
    			attr_dev(div2, "class", "h-100 align-items-center d-flex text-center");
    			add_location(div2, file$4, 30, 8, 859);
    			attr_dev(div3, "class", "carte-arriere bg-white svelte-4nlqkh");
    			add_location(div3, file$4, 29, 6, 814);
    			attr_dev(div4, "class", "carte-conteneur svelte-4nlqkh");
    			add_location(div4, file$4, 23, 4, 594);

    			attr_dev(a, "class", a_class_value = "carte " + (/*carte*/ ctx[0].gagnee || /*carte*/ ctx[0].retournee
    			? 'retournee'
    			: '') + " svelte-4nlqkh");

    			add_location(a, file$4, 19, 2, 482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			mount_component(icone, div0, null);
    			append_dev(div4, t);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			mount_component(fruit, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*retournerCarte*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const fruit_changes = {};
    			if (dirty & /*carte*/ 1) fruit_changes.indexFruit = /*carte*/ ctx[0].indexFruit;
    			fruit.$set(fruit_changes);

    			if (!current || dirty & /*carte*/ 1 && a_class_value !== (a_class_value = "carte " + (/*carte*/ ctx[0].gagnee || /*carte*/ ctx[0].retournee
    			? 'retournee'
    			: '') + " svelte-4nlqkh")) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icone.$$.fragment, local);
    			transition_in(fruit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icone.$$.fragment, local);
    			transition_out(fruit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(icone);
    			destroy_component(fruit);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(18:0) {#if carte}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*carte*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*carte*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*carte*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Carte', slots, []);
    	let { carte } = $$props;

    	// créer un nouveau type d'évènement pour retourner une carte
    	const dispatch = createEventDispatcher();

    	function retournerCarte() {
    		if (!carte.gagnee && !carte.retournee) {
    			$$invalidate(0, carte.retournee = true, carte);
    			dispatch("retourner");
    		}
    	}

    	const writable_props = ['carte'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Carte> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('carte' in $$props) $$invalidate(0, carte = $$props.carte);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Fruit,
    		Icone,
    		carte,
    		dispatch,
    		retournerCarte
    	});

    	$$self.$inject_state = $$props => {
    		if ('carte' in $$props) $$invalidate(0, carte = $$props.carte);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [carte, retournerCarte];
    }

    class Carte extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { carte: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carte",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*carte*/ ctx[0] === undefined && !('carte' in props)) {
    			console.warn("<Carte> was created without expected prop 'carte'");
    		}
    	}

    	get carte() {
    		throw new Error("<Carte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set carte(value) {
    		throw new Error("<Carte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Chrono.svelte generated by Svelte v3.44.2 */

    const file$3 = "src/components/Chrono.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let div0_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*tempsRestant*/ ctx[0]);
    			t1 = text("s");
    			attr_dev(div0, "class", div0_class_value = "progress-bar bg-" + /*pourcentageBg*/ ctx[2](/*pourcentage*/ ctx[1]));
    			attr_dev(div0, "role", "progressbar");
    			attr_dev(div0, "aria-valuenow", /*pourcentage*/ ctx[1]);
    			attr_dev(div0, "aria-valuemin", "0");
    			attr_dev(div0, "aria-valuemax", "100");
    			set_style(div0, "width", /*pourcentage*/ ctx[1] + "%");
    			add_location(div0, file$3, 14, 2, 322);
    			attr_dev(div1, "class", "progress h-100 rounded-0");
    			add_location(div1, file$3, 13, 0, 281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tempsRestant*/ 1) set_data_dev(t0, /*tempsRestant*/ ctx[0]);

    			if (dirty & /*pourcentage*/ 2 && div0_class_value !== (div0_class_value = "progress-bar bg-" + /*pourcentageBg*/ ctx[2](/*pourcentage*/ ctx[1]))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*pourcentage*/ 2) {
    				attr_dev(div0, "aria-valuenow", /*pourcentage*/ ctx[1]);
    			}

    			if (dirty & /*pourcentage*/ 2) {
    				set_style(div0, "width", /*pourcentage*/ ctx[1] + "%");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let pourcentage;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chrono', slots, []);
    	let { tempsRestant } = $$props;
    	let { tempsTotal } = $$props;

    	function pourcentageBg(pourcentage) {
    		if (pourcentage < 30) return "danger";
    		if (pourcentage < 60) return "warning";
    		return "success";
    	}

    	const writable_props = ['tempsRestant', 'tempsTotal'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chrono> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('tempsRestant' in $$props) $$invalidate(0, tempsRestant = $$props.tempsRestant);
    		if ('tempsTotal' in $$props) $$invalidate(3, tempsTotal = $$props.tempsTotal);
    	};

    	$$self.$capture_state = () => ({
    		tempsRestant,
    		tempsTotal,
    		pourcentageBg,
    		pourcentage
    	});

    	$$self.$inject_state = $$props => {
    		if ('tempsRestant' in $$props) $$invalidate(0, tempsRestant = $$props.tempsRestant);
    		if ('tempsTotal' in $$props) $$invalidate(3, tempsTotal = $$props.tempsTotal);
    		if ('pourcentage' in $$props) $$invalidate(1, pourcentage = $$props.pourcentage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tempsRestant, tempsTotal*/ 9) {
    			$$invalidate(1, pourcentage = tempsRestant / tempsTotal * 100);
    		}
    	};

    	return [tempsRestant, pourcentage, pourcentageBg, tempsTotal];
    }

    class Chrono extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { tempsRestant: 0, tempsTotal: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chrono",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tempsRestant*/ ctx[0] === undefined && !('tempsRestant' in props)) {
    			console.warn("<Chrono> was created without expected prop 'tempsRestant'");
    		}

    		if (/*tempsTotal*/ ctx[3] === undefined && !('tempsTotal' in props)) {
    			console.warn("<Chrono> was created without expected prop 'tempsTotal'");
    		}
    	}

    	get tempsRestant() {
    		throw new Error("<Chrono>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tempsRestant(value) {
    		throw new Error("<Chrono>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tempsTotal() {
    		throw new Error("<Chrono>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tempsTotal(value) {
    		throw new Error("<Chrono>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Plateau.svelte generated by Svelte v3.44.2 */
    const file$2 = "src/components/Plateau.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[7] = list;
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (54:4) {#each Array(jeu.cartes.length) as _, i}
    function create_each_block$1(ctx) {
    	let div;
    	let carte;
    	let updating_carte;
    	let t;
    	let current;

    	function carte_carte_binding(value) {
    		/*carte_carte_binding*/ ctx[4](value, /*i*/ ctx[8]);
    	}

    	let carte_props = {};

    	if (/*jeu*/ ctx[0].cartes[/*i*/ ctx[8]] !== void 0) {
    		carte_props.carte = /*jeu*/ ctx[0].cartes[/*i*/ ctx[8]];
    	}

    	carte = new Carte({ props: carte_props, $$inline: true });
    	binding_callbacks.push(() => bind(carte, 'carte', carte_carte_binding));
    	carte.$on("retourner", /*onRetourner*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(carte.$$.fragment);
    			t = space();
    			add_location(div, file$2, 54, 6, 1551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(carte, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const carte_changes = {};

    			if (!updating_carte && dirty & /*jeu*/ 1) {
    				updating_carte = true;
    				carte_changes.carte = /*jeu*/ ctx[0].cartes[/*i*/ ctx[8]];
    				add_flush_callback(() => updating_carte = false);
    			}

    			carte.$set(carte_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carte.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carte.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(carte);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(54:4) {#each Array(jeu.cartes.length) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let section;
    	let t;
    	let chrono;
    	let current;
    	let each_value = Array(/*jeu*/ ctx[0].cartes.length);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	chrono = new Chrono({
    			props: {
    				tempsTotal: /*tempsTotal*/ ctx[1],
    				tempsRestant: /*tempsRestant*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			create_component(chrono.$$.fragment);
    			attr_dev(section, "class", " svelte-ttj522");
    			add_location(section, file$2, 52, 2, 1481);
    			attr_dev(div, "class", "plateau min-vh-100 svelte-ttj522");
    			add_location(div, file$2, 51, 0, 1446);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			append_dev(div, t);
    			mount_component(chrono, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*jeu, onRetourner*/ 9) {
    				each_value = Array(/*jeu*/ ctx[0].cartes.length);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const chrono_changes = {};
    			if (dirty & /*tempsTotal*/ 2) chrono_changes.tempsTotal = /*tempsTotal*/ ctx[1];
    			if (dirty & /*tempsRestant*/ 4) chrono_changes.tempsRestant = /*tempsRestant*/ ctx[2];
    			chrono.$set(chrono_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(chrono.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(chrono.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			destroy_component(chrono);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Plateau', slots, []);
    	let { jeu } = $$props;
    	let { tempsTotal } = $$props;
    	let tempsRestant = tempsTotal;

    	// créer un nouveau type d'évènement pour jeu gagné ou perdu
    	const dispatch = createEventDispatcher();

    	/**
     * À chaque fois qu'une carte est retournée
     */
    	async function onRetourner() {
    		// on récupère les cartes retournées
    		const cartesRetournees = jeu.cartesRetournees();

    		// le nombre de cartes retournées
    		const nbCartesRetournees = cartesRetournees.length;

    		// s'il y a 2 cartes retournées
    		if (nbCartesRetournees == 2) {
    			// si ce sont les mêmes
    			if (cartesRetournees[0].indexFruit == cartesRetournees[1].indexFruit) {
    				jeu.gagnerCarte(cartesRetournees[0].indexFruit);
    			}

    			// si le jeu est gagné ou perdu
    			const statut = jeu.verifierStatut();

    			if (statut.gagne) {
    				jeu.arreterChrono();
    				dispatch("gagne", { temps_realise: tempsTotal - tempsRestant });
    			}

    			// on attend pour ne pas provoquer le retournement immédiat
    			await tick();

    			// et on cache toutes les cartes
    			jeu.cacherCartes();
    		}
    	}

    	// Chrono
    	jeu.demarrerChrono(function () {
    		$$invalidate(2, tempsRestant--, tempsRestant);

    		if (tempsRestant < 1) {
    			jeu.arreterChrono();
    			dispatch("perdu");
    		}
    	});

    	const writable_props = ['jeu', 'tempsTotal'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Plateau> was created with unknown prop '${key}'`);
    	});

    	function carte_carte_binding(value, i) {
    		if ($$self.$$.not_equal(jeu.cartes[i], value)) {
    			jeu.cartes[i] = value;
    			$$invalidate(0, jeu);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('jeu' in $$props) $$invalidate(0, jeu = $$props.jeu);
    		if ('tempsTotal' in $$props) $$invalidate(1, tempsTotal = $$props.tempsTotal);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		tick,
    		Carte,
    		Chrono,
    		jeu,
    		tempsTotal,
    		tempsRestant,
    		dispatch,
    		onRetourner
    	});

    	$$self.$inject_state = $$props => {
    		if ('jeu' in $$props) $$invalidate(0, jeu = $$props.jeu);
    		if ('tempsTotal' in $$props) $$invalidate(1, tempsTotal = $$props.tempsTotal);
    		if ('tempsRestant' in $$props) $$invalidate(2, tempsRestant = $$props.tempsRestant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [jeu, tempsTotal, tempsRestant, onRetourner, carte_carte_binding];
    }

    class Plateau extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { jeu: 0, tempsTotal: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Plateau",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*jeu*/ ctx[0] === undefined && !('jeu' in props)) {
    			console.warn("<Plateau> was created without expected prop 'jeu'");
    		}

    		if (/*tempsTotal*/ ctx[1] === undefined && !('tempsTotal' in props)) {
    			console.warn("<Plateau> was created without expected prop 'tempsTotal'");
    		}
    	}

    	get jeu() {
    		throw new Error("<Plateau>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set jeu(value) {
    		throw new Error("<Plateau>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tempsTotal() {
    		throw new Error("<Plateau>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tempsTotal(value) {
    		throw new Error("<Plateau>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Menu.svelte generated by Svelte v3.44.2 */
    const file$1 = "src/components/Menu.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (27:8) {#if message}
    function create_if_block_1(ctx) {
    	let p;
    	let t_value = /*message*/ ctx[2].texte + "";
    	let t;
    	let p_class_value;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", p_class_value = "display-6 text-center " + /*message*/ ctx[2].classe);
    			add_location(p, file$1, 27, 10, 697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 4 && t_value !== (t_value = /*message*/ ctx[2].texte + "")) set_data_dev(t, t_value);

    			if (dirty & /*message*/ 4 && p_class_value !== (p_class_value = "display-6 text-center " + /*message*/ ctx[2].classe)) {
    				attr_dev(p, "class", p_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(27:8) {#if message}",
    		ctx
    	});

    	return block;
    }

    // (58:8) {:else}
    function create_else_block(ctx) {
    	let strong;

    	const block = {
    		c: function create() {
    			strong = element("strong");
    			strong.textContent = "Aucune partie réalisée pour le moment";
    			add_location(strong, file$1, 61, 10, 1678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, strong, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(strong);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(58:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:8) {#if tempsDeJeu.length}
    function create_if_block$1(ctx) {
    	let div;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let tbody;
    	let each_value = /*tempsDeJeu*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Temps";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Date";
    			t3 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$1, 40, 18, 1079);
    			add_location(th1, file$1, 41, 18, 1112);
    			add_location(tr, file$1, 39, 16, 1056);
    			add_location(thead, file$1, 38, 14, 1032);
    			add_location(tbody, file$1, 44, 14, 1185);
    			attr_dev(table, "class", "table");
    			add_location(table, file$1, 37, 12, 996);
    			attr_dev(div, "class", "table-responsive");
    			add_location(div, file$1, 36, 10, 953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(table, t3);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Date, tempsDeJeu*/ 2) {
    				each_value = /*tempsDeJeu*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(32:8) {#if tempsDeJeu.length}",
    		ctx
    	});

    	return block;
    }

    // (49:16) {#each tempsDeJeu as tps}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*tps*/ ctx[5].temps_realise + "";
    	let t0;
    	let t1;
    	let t2;
    	let td1;
    	let t3_value = new Date(/*tps*/ ctx[5].date_partie).toLocaleDateString() + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = text(" secondes");
    			t2 = space();
    			td1 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			add_location(td0, file$1, 50, 20, 1360);
    			add_location(td1, file$1, 51, 20, 1418);
    			add_location(tr, file$1, 49, 18, 1335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			append_dev(td1, t3);
    			append_dev(tr, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tempsDeJeu*/ 2 && t0_value !== (t0_value = /*tps*/ ctx[5].temps_realise + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*tempsDeJeu*/ 2 && t3_value !== (t3_value = new Date(/*tps*/ ctx[5].date_partie).toLocaleDateString() + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(49:16) {#each tempsDeJeu as tps}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let div4;
    	let div3;
    	let div0;
    	let h5;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div2;
    	let button;
    	let t4_value = (/*tempsDeJeu*/ ctx[1].length ? "Rejouer" : "Jouer") + "";
    	let t4;
    	let div5_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*message*/ ctx[2] && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*tempsDeJeu*/ ctx[1].length) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Memory";
    			t1 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if_block1.c();
    			t3 = space();
    			div2 = element("div");
    			button = element("button");
    			t4 = text(t4_value);
    			attr_dev(h5, "class", "modal-title");
    			add_location(h5, file$1, 23, 8, 585);
    			attr_dev(div0, "class", "modal-header");
    			add_location(div0, file$1, 22, 6, 550);
    			attr_dev(div1, "class", "modal-body");
    			add_location(div1, file$1, 25, 6, 640);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$1, 68, 8, 1872);
    			attr_dev(div2, "class", "modal-footer");
    			add_location(div2, file$1, 64, 6, 1766);
    			attr_dev(div3, "class", "modal-content");
    			add_location(div3, file$1, 21, 4, 516);
    			attr_dev(div4, "class", "modal-dialog");
    			add_location(div4, file$1, 20, 2, 485);
    			attr_dev(div5, "class", div5_class_value = `modal fade bg-secondary ${/*afficher*/ ctx[0] ? "show d-block" : ""}`);
    			add_location(div5, file$1, 19, 0, 409);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h5);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t2);
    			if_block1.m(div1, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(button, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*jouer*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*message*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}

    			if (dirty & /*tempsDeJeu*/ 2 && t4_value !== (t4_value = (/*tempsDeJeu*/ ctx[1].length ? "Rejouer" : "Jouer") + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*afficher*/ 1 && div5_class_value !== (div5_class_value = `modal fade bg-secondary ${/*afficher*/ ctx[0] ? "show d-block" : ""}`)) {
    				attr_dev(div5, "class", div5_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	let { tempsDeJeu = [] } = $$props;
    	let { afficher = false } = $$props;
    	let { message = null } = $$props;

    	// créer un nouveau type d'évènement pour démarrer le jeu
    	const dispatch = createEventDispatcher();

    	function jouer() {
    		$$invalidate(0, afficher = false);
    		dispatch("jouer");
    	}

    	const writable_props = ['tempsDeJeu', 'afficher', 'message'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('tempsDeJeu' in $$props) $$invalidate(1, tempsDeJeu = $$props.tempsDeJeu);
    		if ('afficher' in $$props) $$invalidate(0, afficher = $$props.afficher);
    		if ('message' in $$props) $$invalidate(2, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		tempsDeJeu,
    		afficher,
    		message,
    		dispatch,
    		jouer
    	});

    	$$self.$inject_state = $$props => {
    		if ('tempsDeJeu' in $$props) $$invalidate(1, tempsDeJeu = $$props.tempsDeJeu);
    		if ('afficher' in $$props) $$invalidate(0, afficher = $$props.afficher);
    		if ('message' in $$props) $$invalidate(2, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [afficher, tempsDeJeu, message, jouer];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { tempsDeJeu: 1, afficher: 0, message: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get tempsDeJeu() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tempsDeJeu(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get afficher() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set afficher(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class Jeu {
      constructor(nbCartes, fruits) {
        // on tire dans la liste des fruits la moitié du nombre de cartes
        const choixCartes = this.choixAleatoires(fruits, nbCartes);
        // on double la liste et on tire aléatoirement les cartes
        // et on créé à la volée un objet pour chaque cartes
        this.cartes = this.choixAleatoires(
          choixCartes.concat(choixCartes),
          choixCartes.length * 2
        ).map((fruit) => ({
          fruit,
          indexFruit: fruits.indexOf(fruit),
          retournee: false,
          gagnee: false,
        }));

        // statut du jeu
        this.status = {
          gagne: false,
          perdu: false
        };

        // chrono
        this.chrono = null;
      }

      demarrerChrono(fn) {
        this.chrono = setInterval(fn, 1000);
      }

      arreterChrono() {
        if (this.chrono) clearInterval(this.chrono);
      }
      /**
       * Choisir un nombre d'éléments dans une liste
       */
      choixAleatoires(liste, nombre) {
        // on copie la liste
        const listeCopie = liste.slice();
        // on créer le tableau des choix
        let choix = [];
        for (let i = 0; i < nombre; i++) {
          // on choisit aléatoirement l'index d'un élément de la liste copiée
          const indexAléatoire = Math.floor(Math.random() * listeCopie.length);
          // on prélève cet élément de la liste copiée
          const elementPreleve = listeCopie.splice(indexAléatoire, 1);
          // on ajoute cet élément aux choix
          choix = choix.concat(elementPreleve);
        }
        return choix;
      }

      /**
       * Retourne les cartes retournées
       */
      cartesRetournees() {
        return this.cartes.filter((carte) => carte.retournee);
      }

      /**
       * Dans le cas où les cartes sont les mêmes
       */
      gagnerCarte(indexFruit) {
        for (let i = 0; i < this.cartes.length; i++) {
          if (this.cartes[i].indexFruit == indexFruit) {
            this.cartes[i].gagnee = true;
          }
        }
      }

      /**
       * Cacher toutes les cartes
       */
      cacherCartes() {
        for (let i = 0; i < this.cartes.length; i++) {
          this.cartes[i].retournee = false;
        }
      }

      /**
       * Verifier status du jeu
       */
      verifierStatut() {
        // si le nombre de cartes gagnées correspond
        // au nombre de cartes total
        if (this.cartes.filter(carte => carte.gagnee).length == this.cartes.length) {
          this.status.gagne = true;
        }
        // retourne le status
        return this.status;
      }
    }

    class Api {

      constructor(apiUrl) {
        this.apiUrl = apiUrl;
      }

      /**
       * Liste les temps de jeu
       * Fait appel à la base de données
       * via les scripts php
       */
      async listeTempsDeJeu() {
        const res = await fetch(`${this.apiUrl}/temps-de-jeu`);
        return await res.json();
      }

      /**
       * Ajouter un temps de jeu
       * Écrit dans la base de données
       * via les scripts php
       */
      async ajouterTempsDeJeu(temps_realise) {
        return await fetch(`${this.apiUrl}/temps-de-jeu`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ temps_realise }),
        });
      }
    }

    /* src/App.svelte generated by Svelte v3.44.2 */
    const file = "src/App.svelte";

    // (76:2) {#if jeu}
    function create_if_block(ctx) {
    	let plateau;
    	let updating_jeu;
    	let current;

    	function plateau_jeu_binding(value) {
    		/*plateau_jeu_binding*/ ctx[9](value);
    	}

    	let plateau_props = { tempsTotal: 200 };

    	if (/*jeu*/ ctx[2] !== void 0) {
    		plateau_props.jeu = /*jeu*/ ctx[2];
    	}

    	plateau = new Plateau({ props: plateau_props, $$inline: true });
    	binding_callbacks.push(() => bind(plateau, 'jeu', plateau_jeu_binding));
    	plateau.$on("gagne", /*onGagne*/ ctx[4]);
    	plateau.$on("perdu", /*onPerdu*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(plateau.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(plateau, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const plateau_changes = {};

    			if (!updating_jeu && dirty & /*jeu*/ 4) {
    				updating_jeu = true;
    				plateau_changes.jeu = /*jeu*/ ctx[2];
    				add_flush_callback(() => updating_jeu = false);
    			}

    			plateau.$set(plateau_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(plateau.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(plateau.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(plateau, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(76:2) {#if jeu}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let menu;
    	let updating_afficher;
    	let t;
    	let current;

    	function menu_afficher_binding(value) {
    		/*menu_afficher_binding*/ ctx[8](value);
    	}

    	let menu_props = {
    		tempsDeJeu: /*tempsDeJeu*/ ctx[3],
    		message: /*messageMenu*/ ctx[1]
    	};

    	if (/*afficherMenu*/ ctx[0] !== void 0) {
    		menu_props.afficher = /*afficherMenu*/ ctx[0];
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });
    	binding_callbacks.push(() => bind(menu, 'afficher', menu_afficher_binding));
    	menu.$on("jouer", /*demarrerJeu*/ ctx[6]);
    	let if_block = /*jeu*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			add_location(main, file, 67, 0, 1484);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(menu, main, null);
    			append_dev(main, t);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const menu_changes = {};
    			if (dirty & /*tempsDeJeu*/ 8) menu_changes.tempsDeJeu = /*tempsDeJeu*/ ctx[3];
    			if (dirty & /*messageMenu*/ 2) menu_changes.message = /*messageMenu*/ ctx[1];

    			if (!updating_afficher && dirty & /*afficherMenu*/ 1) {
    				updating_afficher = true;
    				menu_changes.afficher = /*afficherMenu*/ ctx[0];
    				add_flush_callback(() => updating_afficher = false);
    			}

    			menu.$set(menu_changes);

    			if (/*jeu*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*jeu*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(menu);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { apiUrl } = $$props;
    	let afficherMenu = true;
    	let messageMenu = { texte: "", classe: "" };
    	let jeu;
    	let tempsDeJeu;
    	const api = new Api(apiUrl);

    	/**
     * Au démarrage de l'application,
     * on charge les temps précédents
     */
    	onMount(async () => {
    		$$invalidate(3, tempsDeJeu = await api.listeTempsDeJeu());
    	});

    	/**
     * Quand le jeu est gagné
     */
    	async function onGagne({ detail }) {
    		const res = await api.ajouterTempsDeJeu(detail.temps_realise);

    		// si la requête a échoué
    		if (res.status != 200) {
    			// on affiche le message d'erreur
    			alert(res.statusText);

    			return;
    		}

    		// on recharge les temps de jeu
    		$$invalidate(3, tempsDeJeu = await api.listeTempsDeJeu());

    		// on personnalise le message du menu
    		$$invalidate(1, messageMenu = {
    			texte: `C'est gagné !`,
    			classe: "alert alert-success"
    		});

    		$$invalidate(0, afficherMenu = true);

    		// on supprime le jeu
    		$$invalidate(2, jeu = null);
    	}

    	function onPerdu() {
    		// on personnalise le message du menu
    		$$invalidate(1, messageMenu = {
    			texte: `Game Over`,
    			classe: "alert alert-danger"
    		});

    		$$invalidate(0, afficherMenu = true);

    		// on supprime le jeu
    		$$invalidate(2, jeu = null);
    	}

    	function demarrerJeu() {
    		// démarrer le jeu
    		$$invalidate(2, jeu = new Jeu(14, fruits));
    	}

    	const writable_props = ['apiUrl'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function menu_afficher_binding(value) {
    		afficherMenu = value;
    		$$invalidate(0, afficherMenu);
    	}

    	function plateau_jeu_binding(value) {
    		jeu = value;
    		$$invalidate(2, jeu);
    	}

    	$$self.$$set = $$props => {
    		if ('apiUrl' in $$props) $$invalidate(7, apiUrl = $$props.apiUrl);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Plateau,
    		Menu,
    		fruits,
    		Jeu,
    		Api,
    		apiUrl,
    		afficherMenu,
    		messageMenu,
    		jeu,
    		tempsDeJeu,
    		api,
    		onGagne,
    		onPerdu,
    		demarrerJeu
    	});

    	$$self.$inject_state = $$props => {
    		if ('apiUrl' in $$props) $$invalidate(7, apiUrl = $$props.apiUrl);
    		if ('afficherMenu' in $$props) $$invalidate(0, afficherMenu = $$props.afficherMenu);
    		if ('messageMenu' in $$props) $$invalidate(1, messageMenu = $$props.messageMenu);
    		if ('jeu' in $$props) $$invalidate(2, jeu = $$props.jeu);
    		if ('tempsDeJeu' in $$props) $$invalidate(3, tempsDeJeu = $$props.tempsDeJeu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		afficherMenu,
    		messageMenu,
    		jeu,
    		tempsDeJeu,
    		onGagne,
    		onPerdu,
    		demarrerJeu,
    		apiUrl,
    		menu_afficher_binding,
    		plateau_jeu_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { apiUrl: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*apiUrl*/ ctx[7] === undefined && !('apiUrl' in props)) {
    			console.warn("<App> was created without expected prop 'apiUrl'");
    		}
    	}

    	get apiUrl() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set apiUrl(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.querySelector('#app'),
    	props: {
    		apiUrl: 'http://localhost:8000'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
