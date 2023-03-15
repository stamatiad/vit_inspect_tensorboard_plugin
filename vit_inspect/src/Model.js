import React from "react";
import ModelItem from "./ModelItem";
import ModelSelector from "./ModelSelector";
import PixelQuery from "./PixelQuery";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import Visualizer from "./Visualizer";

// The import statement is for the webpack to know the dependence on
// external js/css files and to add them to the compiled output.
import '../static/js/bootstrap.min.js'
import '../static/css/bootstrap.min.css';
import '../static/css/main.css';



class Model extends React.Component {
    // This component holds the model that is being visualized.
    constructor(props) {
        super(props);
        /* This component is the main App. It holds the model and visualizer
         states. Every param and selection is stored in this state. Yet, on
         its update, child components are responsible to check and update
         their states if necessary.
         If some child component implements a loading functionality, should
          save on this state on completion, so all other childs get updated
           promptly and properly.
         */
        this.state = {
            // These are the model props that are used by all child components:
            vi_params: {
                models_arr: [],
                /* These are used by the visualizer to render the appropriate
                   maps. So, update their state when everything is ready to be
                   visualized in the main window.
                   These are tricky params, because on every layer load will
                    cause every child to re-render. So each child that should
                     take responsibility and check if should re-render.
                 */
                selected_layer: 0,
                selected_token: 0,
                // The batch and attn maps image metadata. Every component
                // should save any updated state here, and load from here.
                batch_blob_key: "",
                attn_blob_key_arr: [],
            },
            // THE MODEL OBJ GETS OVERWITTEN when the TB loads the model
            // from TF!
            // These values are just to create the state structure! DO NOT
            // ADD VALUES INSIDE THE MODEL OBJECT, THEY WILL BE OVERWRITTEN!
            model: {
                params: {
                    num_layers: undefined,
                    num_heads: undefined,
                    len_in_patches: undefined,
                },
            },
        };
        /*
        Props functions. Pass them to child components, in an object to
         avoid renaming them in all intermediate components.
        */
        this.pf = {
            fetchImgBlobKey(run, tag, sample, callback) {
                // Returns a promise!
                var url = `/data/plugin/vit_inspect/images?run=${run}&tag=${tag}&sample=${sample}`;
                const blob_key = fetch(url)
                    .then((response) => {
                        //TODO: how do you handlee/notice this error?
                        if (!response.ok) {
                            throw new Error(
                                `HTTP error: ${response.status}\n\tFailed to fetch image from:\n\t${url}`
                            );
                        }
                        console.log("IMAGE FETCHED SUCCESSFULLY!")
                        return response;
                    })
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        // Get the first and only sample, that is our image.
                        return data[0].blob_key;
                    })
                    .then((blob_key) => {
                        /*
                            Callback to parent to pass the message that we are done
                            fetching, and move on, without waiting for callback to
                            return.
                        */
                        //TODO: Is this callback async? It should be!
                        callback();
                        return blob_key;
                    })
                    .catch((error) => {
                        console.log(`Could not get image: \n\t${url}`);
                        return null;
                    });
                return blob_key;
            },

            fetchLayerBlobKeys(run, tag, layer, callback) {
                // Returns a promise!
                var url = `/data/plugin/vit_inspect/layers?run=${run}&tag=${tag}&layer=${layer}`;
                const blob_keys = fetch(url)
                    .then((response) => {
                        //TODO: how do you handlee/notice this error?
                        if (!response.ok) {
                            throw new Error(
                                `HTTP error: ${response.status}\n\tFailed to fetch image from:\n\t${url}`
                            );
                        }
                        console.log("IMAGE FETCHED SUCCESSFULLY!")
                        return response;
                    })
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        // Get the first and only sample, that is our image.
                        // TODO: WHY only the first sample? HANDLE multiple cases!
                        return data.blob_keys;
                    })
                    .then((blob_keys) => {
                        /*
                            Callback to parent to pass the message that we are done
                            fetching, and move on, without waiting for callback to
                            return.
                        */
                        //TODO: Is this callback async? It should be!
                        callback();
                        return blob_keys;
                    })
                    .catch((error) => {
                        console.log(`Could not get layer: \n\t${url}`);
                        return null;
                    });
                return blob_keys;
            },

            async fetchLayerMapsAsync(model, callback) {
                // returns a Promise!
                // Fetches attention maps for the requested layer.
                var cmp = this;
                const layer_maps = [];
                // SOS: We name differently the batch tags and the per layer tags!
                // E.g the 'b0' is the whole batch tag and the 'b0l2' is its layer 2
                // attention maps. So we need to change the tag string in the request!
                //TODO: Make sure that their load and save indexing is the same!!!
                for (const layer of Array(model.params.num_layers).keys()) {
                    layer_maps.push(cmp.pf.fetchLayerBlobKeys(
                        model.run,
                        `${model.tag}l${layer}`,
                        layer,
                        callback
                    ));
                }
                return Promise.all(layer_maps);
            },

            async loadAttnMapsToModelAsync(attn_arr) {
                var cmp = this;
                return cmp.setStateAsync({
                    ...cmp.state,
                    vi_params: {
                        ...cmp.state.vi_params,
                        attn_blob_key_arr: attn_arr
                    },
                });
            },

            async selectModelAsync(model_id) {
                // This will begin fetching the tag's metadata.
                var cmp = this;

                // Get model's run and tag:
                var model = cmp.state.vi_params.models_arr[model_id];

                return cmp.setStateAsync({
                    ...cmp.state,
                    model: model
                });
            },

            async selectLayerAsync(layer_id) {
                // This function should reside in the main Model, so to avoid cyclic
                // state updates (are these a thing??).
                var cmp = this;

                // Then update the state of the model. We need to wait until
                // everything is ready to update the Model, because the visualizer
                // will re-render.

                return cmp.setStateAsync({
                    ...cmp.state,
                    vi_params: {
                        ...cmp.state.vi_params,
                        selected_layer: layer_id,
                    },
                });
            },

            async selectHeadAsync(head_id) {
                // This function should reside in the main Model, so to avoid cyclic
                // state updates (are these a thing??).
                var cmp = this;

                // Then update the state of the model. We need to wait until
                // everything is ready to update the Model, because the visualizer
                // will re-render.

                return cmp.setStateAsync({
                    ...cmp.state,
                    vi_params: {
                        ...cmp.state.vi_params,
                        selected_head: head_id,
                    },
                });
            },

            fetchRunsTags() {
                var url = "/data/plugin/vit_inspect/tags";
                const raw_tags = fetch(url)
                    .then((response) => {
                        //TODO: how do you handlee/notice this error?
                        if (!response.ok) {
                            throw new Error(
                                `HTTP error: ${response.status}\n\tFailed to fetch model tags from:\n\t${url}`
                            );
                        }
                        return response;
                    })
                    .then((response) => {
                        console.log("MODELS FETCHED SUCCESSFULLY!");
                        return response.json();
                    })
                    .then((data) => {
                        console.log("MODELS PARSED SUCCESSFULLY!");
                        return data;
                    })
                    .catch((error) => {
                        console.log(`Could not get tags: \n\t${url}`);
                        return null;
                    });

                return raw_tags;
            },

            queryPixel(i, j) {
                var cmp = this;
                console.log(`Model has been updated. Pixel queried is ${i} ${j}`);
                // TODO: rename to len_in_tokens. Use tokens from now on. No need to
                //  use pixels, since there is no reference to pixels anywhere.
                var len_in_patches = cmp.state.model.params.len_in_patches;
                // Update the Visualizer with the new data
                cmp.setState({
                    ...cmp.state,
                    vi_params: {
                        ...cmp.state.vi_params,
                        selected_token: i * len_in_patches + j
                    }
                });
            }
        };

        this.updateModelsList = this.updateModelsList.bind(this);

        this.pf.selectModelAsync = this.pf.selectModelAsync.bind(this);
        this.pf.selectLayerAsync = this.pf.selectLayerAsync.bind(this);
        this.pf.selectHeadAsync = this.pf.selectHeadAsync.bind(this);
        this.pf.fetchLayerMapsAsync = this.pf.fetchLayerMapsAsync.bind(this);
        this.pf.loadAttnMapsToModelAsync = this.pf.loadAttnMapsToModelAsync.bind(this);
        this.pf.queryPixel = this.pf.queryPixel.bind(this);
    }

    componentDidMount() {
        this.updateModelsList();
    }

    render() {
        console.log(`Rendering MAIN`);
        return (
            <div className="App">
                <main>
                    <Sidebar
                        vi_params={this.state.vi_params}
                        model={this.state.model}
                        pf={this.pf}
                    />
                    <Visualizer
                        model={this.state.model}
                        vi_params={this.state.vi_params}
                        //TODO: If I update only this will the whole model
                        // and affected components be updated?
                        selected_layer={this.state.vi_params.selected_layer}
                        selected_token={this.state.vi_params.selected_token}
                    />
                    <RightSidebar
                        vi_params={this.state.vi_params}
                        model={this.state.model}
                        pf={this.pf}
                    />
                </main>
            </div>
        );
    };

    //==========================================================================
    // Component functions
    //==========================================================================

    setStateAsync = (newState) => {
        /*
        Use promisified state set in order to chain thens.
        */
        return new Promise((resolve) => this.setState(newState, resolve));
    }

    async updateModelsList() {
        var cmp = this;
        var id = 0;

        const raw_tags = await cmp.pf.fetchRunsTags();
        var models_arr = [];
        for (const [run, run_obj] of Object.entries(raw_tags)) {
            for (const [tag, tag_obj] of Object.entries(run_obj)) {
                // Change the tag object and restructure it, adding the
                // model params, yet keeping any custom description that
                // might exist.
                var model = tag_obj;
                // Remove <p> tags from description first:
                var params = JSON.parse(tag_obj.description.slice(3, -4));
                //TODO: remember to add handling for empty description:
                //to.description = params.description;
                // Organize all the info, inside the model object:
                model.id = id;
                model.run = run;
                model.tag = tag;
                model.params = params;
                models_arr.push(model);
                id += 1;
            }
        }
        // Update all relevant components:
        cmp.setState(
            {
                ...cmp.state,
                vi_params: {
                    ...cmp.state.vi_params,
                    models_arr: models_arr
                }
            }
        )
    }


}






export default Model;