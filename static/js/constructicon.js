// with this we make js less forgiving so that we catch
// more hidden errors during development
'use strict';


// https://stackoverflow.com/a/196991
function to_title_case(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}


function build_search_index(record_numbers, records, keys) {
    let search_index = new JsSearch.Search('record');
    // https://github.com/bvaughn/js-search#configuring-the-index-strategy
    search_index.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    for (let key of keys) {
        search_index.addIndex(key);
    }
    for (let record_number of record_numbers) {
        search_index.addDocuments([records[record_number]]);
    }
    return search_index;
}


function collect_options(record_numbers, records, key, is_list) {
    let s = new Set();
    for (let record_number of record_numbers) {
        if (is_list) {
            for (let element of records[record_number][key]) {
                if (element != null) {
                    s.add(element);
                }
            }
        } else {
            let element = records[record_number][key];
            if (element != null) {
                s.add(element);
            }
        }
    }

    let items = Array.from(s);
    items.sort();

    let tree = [];
    for (let element of items) {
        tree.push({
            id: element,
            label: element
        });
    }

    return tree;
}


function object_is_empty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


// translates array to list of items
function _helper(array) {
    let tree = [];

    let keys = [];
    for (let prop in array) {
        keys.push(prop);
    }
    keys.sort();

    for (let prop of keys) {
        if (Object.prototype.hasOwnProperty.call(array, prop)) {
            if (object_is_empty(prop)) {
                tree.push({
                    id: prop,
                    label: prop,
                });
            } else {
                tree.push({
                    id: prop,
                    label: prop,
                    children: _helper(array[prop]),
                });
            }
        }
    }

    return tree;
}


function collect_options_tree(record_numbers, records, key) {
    // first we build up a simpler array tree from all entries
    let tree_array = {};
    for (let record_number of record_numbers) {
        if (records[record_number][key] != null) {
            for (let element_0 of records[record_number][key]) {
                let type_0 = element_0["type"];
                if (!(type_0 in tree_array)) {
                    tree_array[type_0] = {};
                }
                if ("subtypes" in element_0) {
                    for (let element_1 of element_0["subtypes"]) {
                        let type_1 = element_1["type"];
                        if (!(type_1 in tree_array[type_0])) {
                            tree_array[type_0][type_1] = {};
                        }
                        if ("subtypes" in element_1) {
                            for (let element_2 of element_1["subtypes"]) {
                                let type_2 = element_2["type"];
                                if (!(type_2 in tree_array[type_0][type_1])) {
                                    tree_array[type_0][type_1][type_2] = {};
                                }
                                if ("subtypes" in element_2) {
                                    for (let element_3 of element_2["subtypes"]) {
                                        let type_3 = element_3["type"];
                                        if (!(type_3 in tree_array[type_0][type_1][type_2])) {
                                            tree_array[type_0][type_1][type_2][type_3] = {};
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // in the second step we translate this to a structure required by https://vue-treeselect.js.org/
    let tree = _helper(tree_array);

    return tree;
}


function flatten_semantic_types(record_numbers, records) {
    let key = "semantic_types";

    // FIXME: this traversal is similar to function above
    for (let record_number of record_numbers) {
        let flattened_list = [];
        if (records[record_number][key] != null) {
            for (let element_0 of records[record_number][key]) {
                let type_0 = element_0["type"];
                flattened_list.push(type_0);
                if ("subtypes" in element_0) {
                    for (let element_1 of element_0["subtypes"]) {
                        let type_1 = element_1["type"];
                        flattened_list.push(type_1);
                        if ("subtypes" in element_1) {
                            for (let element_2 of element_1["subtypes"]) {
                                let type_2 = element_2["type"];
                                flattened_list.push(type_2);
                                if ("subtypes" in element_2) {
                                    for (let element_3 of element_2["subtypes"]) {
                                        let type_3 = element_3["type"];
                                        flattened_list.push(type_3);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        records[record_number]["semantic_types_flat"] = flattened_list;
    }

    return records;
}


async function fetch_data(data, url_prefix) {
    // let r = await axios.get(url_prefix + 'data-combined-debug.yml');
    let r = await axios.get(url_prefix + 'data-combined.yml');
    let json_data = jsyaml.load(r.data);

    let records = {};
    let record_numbers = [];
    let levels = new Set();

    for (let key of Object.keys(json_data)) {
        records[key] = json_data[key];
        records[key].record = key;
        record_numbers.push(key);
        levels.add(json_data[key].cefr_level);
    }

    data.records = records;
    data.record_numbers = record_numbers;

    data.levels = Array.from(levels);
    data.levels.sort();

    data.semantic_roles_options = collect_options(data.record_numbers, data.records, 'semantic_roles', true);
    data.morphology_options = collect_options(data.record_numbers, data.records, 'morphology', true);
    data.syntactic_type_of_construction_options = collect_options(data.record_numbers, data.records, 'syntactic_type_of_construction', true);
    data.syntactic_function_of_anchor_options = collect_options(data.record_numbers, data.records, 'syntactic_function_of_anchor', true);
    data.syntactic_structure_of_anchor_options = collect_options(data.record_numbers, data.records, 'syntactic_structure_of_anchor', true);
    data.part_of_speech_of_anchor_options = collect_options(data.record_numbers, data.records, 'part_of_speech_of_anchor', true);
    data.level_options = collect_options(data.record_numbers, data.records, 'cefr_level', false);

    data.semantic_types_options = collect_options_tree(data.record_numbers, data.records, 'semantic_types');

    // we need to flatten the semantic types tree for the search index
    // for some reason it does not pick up the options otherwise
    data.records = flatten_semantic_types(data.record_numbers, data.records);

    data.search_index = {};
    for (let key of ['name',
            'illustration',
            'semantic_roles',
            'morphology',
            'syntactic_type_of_construction',
            'syntactic_function_of_anchor',
            'syntactic_structure_of_anchor',
            'part_of_speech_of_anchor',
            'cefr_level',
            'semantic_types_flat',
        ]) {
        data.search_index[key] = build_search_index(data.record_numbers, data.records, [key]);
    }

    data.all_data_loaded = true;
    data.show_data_spinner = false;
}


// based on https://stackoverflow.com/a/19270021 (CC-BY-SA 3.0)
function random_selection(arr, n_max) {
    let len = arr.length;
    let n = Math.min(n_max, len);
    let result = new Array(n);
    let taken = new Array(len);
    while (n--) {
        let x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}


Vue.component('treeselect', VueTreeselect.Treeselect);


var app = new Vue({
    el: '#app',
    delimiters: ['{[', ']}'],
    data: {
        search_index: null,
        show_additional_information: false,
        show_data_spinner: true,
        all_data_loaded: false,
        current_record_number: null,
        record_numbers: [],
        record_numbers_matching_search: [],
        records: {},
        daily_dose_level: 'A1',
        search_string: '',
        levels: [],
        semantic_roles_options: [],
        semantic_roles_selected: null,
        morphology_options: [],
        morphology_selected: null,
        syntactic_type_of_construction_options: [],
        syntactic_type_of_construction_selected: null,
        syntactic_function_of_anchor_options: [],
        syntactic_function_of_anchor_selected: null,
        syntactic_structure_of_anchor_options: [],
        syntactic_structure_of_anchor_selected: null,
        part_of_speech_of_anchor_options: [],
        part_of_speech_of_anchor_selected: null,
        level_options: [],
        level_selected: null,
        semantic_types_options: [],
        semantic_types_selected: null,
    },
    created: function() {
        this.show_data_spinner = true;
        fetch_data(this, 'https://raw.githubusercontent.com/constructicon/russian-data/generated/');

        // https://lodash.com/docs#debounce
        this.search_debounced = _.debounce(this.search, 500);
        this.advanced_search_debounced = _.debounce(this.advanced_search, 500);
    },
    watch: {
        all_data_loaded: function(new_, old_) {
            // to make sure that when we load the page first time, we see all results
            this.search();
            this.set_record_from_fragment();
            this.track_fragment();
        },
        search_string: function(new_, old_) {
            this.search_debounced();
        },
        semantic_roles_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        morphology_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        syntactic_type_of_construction_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        syntactic_function_of_anchor_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        syntactic_structure_of_anchor_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        part_of_speech_of_anchor_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        level_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        semantic_types_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        current_record_number: function(new_, old_) {
            this.set_fragment_from_record(new_);
        },
    },
    methods: {
        // for x={'this': 'that'} returns 'this'
        key: function(x) {
            return Object.keys(x)[0];
        },
        // for x={'this': 'that'} returns 'that'
        value: function(x) {
            return x[Object.keys(x)[0]];
        },
        search: function() {
            let record_numbers_matching_search = [];

            if (this.search_string == '') {
                record_numbers_matching_search = this.record_numbers;
            } else {
                for (let key of ["name", "illustration"]) {
                    for (let result of this.search_index[key].search(this.search_string)) {
                        record_numbers_matching_search.push(result.record);
                    }
                }
            }

            record_numbers_matching_search = [...new Set(record_numbers_matching_search)];
            record_numbers_matching_search.sort((a, b) => a - b);
            this.record_numbers_matching_search = record_numbers_matching_search;
        },
        advanced_search: function() {
            let record_numbers_matching_search = [];

            let selected_options = {};
            selected_options['semantic_roles'] = this.semantic_roles_selected;
            selected_options['morphology'] = this.morphology_selected;
            selected_options['syntactic_type_of_construction'] = this.syntactic_type_of_construction_selected;
            selected_options['syntactic_function_of_anchor'] = this.syntactic_function_of_anchor_selected;
            selected_options['syntactic_structure_of_anchor'] = this.syntactic_structure_of_anchor_selected;
            selected_options['part_of_speech_of_anchor'] = this.part_of_speech_of_anchor_selected;
            selected_options['cefr_level'] = this.level_selected;
            selected_options['semantic_types_flat'] = this.semantic_types_selected;

            for (let key of [
                    'semantic_roles',
                    'morphology',
                    'syntactic_type_of_construction',
                    'syntactic_function_of_anchor',
                    'syntactic_structure_of_anchor',
                    'part_of_speech_of_anchor',
                    'cefr_level',
                    'semantic_types_flat',
                ]) {
                if (selected_options[key] != null) {
                    let search_string = '"' + selected_options[key].join('" "') + '"';
                    for (let result of this.search_index[key].search(search_string)) {
                        record_numbers_matching_search.push(result.record);
                    }
                }
            }

            record_numbers_matching_search = [...new Set(record_numbers_matching_search)];
            record_numbers_matching_search.sort((a, b) => a - b);
            this.record_numbers_matching_search = record_numbers_matching_search;
        },
        annotate: function(text) {
            // renders words that come right after [...] as subscript with color
            let matches = text.match(/(?<=\])[A-Za-z]+/g);
            for (let substring of matches) {
                text = text.replace(substring, '<sub><span style="color: #db2f6d">' + substring + '</span></sub>');
            }
            return text;
        },
        get_random_selection: function() {
            let records_with_this_level = [];
            for (let record_number of this.record_numbers) {
                if (this.records[record_number].cefr_level == this.daily_dose_level) {
                    records_with_this_level.push(record_number);
                }
            }
            let selected = random_selection(records_with_this_level, 5);
            selected.sort((a, b) => a - b);
            this.record_numbers_matching_search = selected;
        },
        set_record_from_fragment: function() {
            let fragment = window.location.hash.slice(1);
            this.current_record_number = this.record_numbers.includes(fragment) ? fragment : null;
        },
        track_fragment: function() {
            window.addEventListener('hashchange', () => {
                this.set_record_from_fragment();
            });
        },
        set_fragment_from_record: function (record_number) {
            if (record_number && record_number !== window.location.hash.slice(1)) {
                window.history.pushState(null, '', '#' + record_number);
            }
        },
    }
})
