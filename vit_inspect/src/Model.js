import React from "react";
import ModelItem from "./ModelItem";
import ModelSelector from "./ModelSelector";
import PixelQuery from "./PixelQuery";
import Sidebar from "./Sidebar";

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
            models_arr: [],
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
                // The batch and attn maps image metadata:
                batch_blob_key: "",
                attn_blob_key_arr: [],
                // Although not directly model's properties, we keep them
                // here, so we need to pass only the model as React prop around.
            },
            /* These are used by the visualizer to render the appropriate
               maps. So, update their state when everything is ready to be
               visualized in the main window.
               These are tricky params, because on every layer load will
                cause every child to re-render. So each child that should
                 take responsibility and check if should re-render.
             */
            selected_layer: 0,
            selected_token: 0,
        };
        this.selectModel = this.selectModel.bind(this);
        this.updateModel = this.updateModel.bind(this);
        this.selectLayer = this.selectLayer.bind(this);
        this.updateModelsList = this.updateModelsList.bind(this);
        this.queryPixel = this.queryPixel.bind(this);
    }

    fetchImgBlobKey(run, tag, sample){
        // Returns a promise!
        var url = `http://localhost:6006/data/plugin/vit_inspect/images?run=${run}&tag=${tag}&sample=${sample}`;
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
            .catch((error) => {
                console.log(`Could not get image: \n\t${url}`);
                return null;
            });
        return blob_key;
    }

    fetchLayerMaps(model, layer){
        // returns a Promise!
        // Fetches attention maps for the requested layer.
        var cmp = this;
        const layer_maps = [];
        // SOS: We name differently the batch tags and the per layer tags!
        // E.g the 'b0' is the whole batch tag and the 'b0l2' is its layer 2
        // attention maps. So we need to change the tag string in the request!
        var total_tokens = Math.pow(model.params.len_in_patches, 2);
        //TODO: Make sure that their load and save indexing is the same!!!
        //TODO: Just one active layer for now, because it takes so much time
        // to load all of them (do the browser caches the previous layers or
        // should I do this?):
        for (const head of Array(model.params.num_heads).keys()) {
            for (const token of Array(total_tokens).keys()) {
                layer_maps.push(cmp.fetchImgBlobKey(
                    model.run,
                    `${model.tag}l${layer}`,
                    head * total_tokens + token
                ))
            }
        }
        return Promise.all(layer_maps);
    }

    async selectModel(model_id) {
        // This will begin fetching the tag's metadata.
        var cmp = this;
        // Inform the Tags List that this is the active tag that we inspect:
        //this.props.click(this.props.run, this.props.tag, this.props.id,
        // this.props.obj);

        // Get model's run and tag:
        var model = cmp.state.models_arr[model_id];
        // Load asynchronously the batch image and the attention maps
        // keys:
        const batch_blob_key = await cmp.fetchImgBlobKey(
            model.run, model.tag, 0
        );
        var attn_blob_key_arr = [];
        //const attn_blob_key_arr = await cmp.fetchLayerMaps(model);
        //TODO: Make this saving into an 2d array, maintaining blobs for
        // each layer:
        for (var i = 0; i < model.params.num_layers; i++){
            attn_blob_key_arr.push([]);
        }
        //Call method that loads more layer blobs. Load layer 0 for starters.
        attn_blob_key_arr[0] = await cmp.fetchLayerMaps(model, 0);

        // Update the model state with the selected model's params:
        model.batch_blob_key = batch_blob_key;
        model.attn_blob_key_arr = attn_blob_key_arr;
        cmp.setState({
            model: model
            //model_id: model_id,
            //batch_blob_key: batch_blob_key,
            //attn_blob_key_arr: attn_blob_key_arr
        },() => {
            console.log(`MODEL LOADED:
                run: ${cmp.state.model.run}, 
                tag: ${cmp.state.model.tag}, 
                blob key: ${cmp.state.model.batch_blob_key}`);
        });
    }

    async selectLayer(layer_id) {
        // This function should reside in the main Model, so to avoid cyclic
        // state updates (are these a thing??).
        var cmp = this;

        // First load the layer attention maps:
        // Call method that loads selected layer's blobs.
        var attn_blob_key_arr = cmp.state.model.attn_blob_key_arr;
        // Impromptu caching: if blobs already loaded, do not load them again!
        if (attn_blob_key_arr[layer_id].length == 0){
            attn_blob_key_arr[layer_id] = await cmp.fetchLayerMaps(cmp.state.model, layer_id);
        }

        // Then update the state of the model. We need to wait until
        // everything is ready to update the Model, because the visualizer
        // will re-render.
        cmp.setState({
            selected_layer: layer_id,
            attn_blob_key_arr: attn_blob_key_arr
        },() => {
            console.log(`Layer has loaded: ${layer_id}`);
        });
    }

    updateModel(state_update) {
        var cmp = this;
        // Passes the child state (on update) to this component.
        cmp.setState(state_update);
        cmp.forceUpdate();
    }

    fetchRunsTags() {
        var url = "http://localhost:6006/data/plugin/vit_inspect/tags";
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
    }

    async updateModelsList() {
        var cmp = this;
        var id = 0;

        const raw_tags = await cmp.fetchRunsTags();
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
                models_arr: models_arr
            }
        )
    }

    queryPixel(i, j) {
        var cmp = this;
        console.log(`Model has been notified. Pixel queried is ${i} ${j}`);
        // TODO: rename to len_in_tokens. Use tokens from now on. No need to
        //  use pixels, since there is no reference to pixels anywhere.
        var len_in_patches = cmp.state.model.params.len_in_patches;
        // Update the Visualizer with the new data
        cmp.setState({
            selected_token: i * len_in_patches + j
        });
    }

    componentDidMount() {
        this.updateModelsList();
    }

    render(){
        console.log(`Rendering MAIN`);
        return (
            <div className="App">
                <main>
                    <Sidebar
                        models_arr={this.state.models_arr}
                        //len_in_patches={this.state.model.params.len_in_patches}
                        model={this.state.model}
                        selectModel={this.selectModel}
                        selectLayer={this.selectLayer}
                        fetchImgBlobKey={this.fetchImgBlobKey}
                        fetchLayerMaps={this.fetchLayerMaps}
                        queryPixel={this.queryPixel}
                        up={this.updateModel}
                    />
                    <WeightsImgGrid
                        model={this.state.model}
                        //TODO: If I update only this will the whole model
                        // and affected components be updated?
                        selected_layer={this.state.selected_layer}
                        selected_token={this.state.selected_token}
                        //heads={this.state.model.params.num_heads}
                        up={this.updateParent}
                    />
                </main>
            </div>
        );
    };
}


class WeightsImg extends React.Component{
    constructor(props) {
        super(props);
        //TODO: I'm not sure I want two image elements here...
        var img = new Image();
        //TODO: This way src will be updated only the first time its
        // constructed? What about when a different model loads? Will be
        // called again? Since it gets created again, yes.
        img.src = this.props.src;
        //img.setAttribute("class", "img-thumbnail");
        this.state = {
            img: img
        };
    }
    componentDidMount() {

    }

    render(){
        return (
            <>
                <div className="" id="weights-img"
                     style={{gridArea: `${this.props.layer} ${this.props.head} 
                 ${this.props.layer} ${this.props.head}`}}
                >
                    <img className={"img-thumbnail"} src={this.state.img.src}/>
                </div>
            </>
        );
    }
}

class WeightsImgGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    makeGridStyle() {
        // Generate the styles to be used in grid:
        return {
            display: "grid",
            gridTemplateRows: "repeat("+this.props.model.params.num_layers+", 1fr)",
            gridTemplateColumns: "repeat("+this.props.model.params.num_heads+", 1fr)"
        };
    }

    makeImgUrl(wid) {
        var attnw_arr = this.props.model.attn_blob_key_arr;
        return `individualImage?blob_key=${attnw_arr[wid]}}`;
    }

    Grid () {
        // Array of React Components:
        var grid = [];
        var num_layers = this.props.model.params.num_layers;
        var num_heads = this.props.model.params.num_heads;
        var total_tokens = Math.pow(this.props.model.params.len_in_patches, 2);
        var selected_layer = this.props.selected_layer;
        var selected_token = this.props.selected_token;
        var start_layer = selected_layer;
        var end_layer = selected_layer + 1;
        // Handle user showing all layers:
        if (selected_layer < 0){
           start_layer = 0;
           end_layer = num_layers;
        }
        //TODO: !!!
        //var src = this.props.model.params.attn_blob_key_arr[0];
        if ((typeof num_layers == 'undefined') || (typeof num_heads == 'undefined')){
            return <></>;
        }

        //TODO: this should render as a grid only if user selects to show
        // all layers. Else should render as a line.
        for (let l=start_layer; l < end_layer; l++) {
            for (let h=0; h < num_heads; h++) {
                // Get the weight mat id:
                // TODO: adapt to the selection of a single layer
                //var wid = (l*num_heads+h) * total_tokens + selected_token;
                //TODO: you should fetchLayerMaps() again, since we are
                // changing layer!
                var wid = h * total_tokens + selected_token;
                grid.push(
                    <WeightsImg
                        key={wid}
                        layer={l}
                        head={h}
                        src={this.makeImgUrl(wid)}
                    />
                );
            }
        }
        return grid;
    };

    render() {
        return (
            <div className="container-fluid">
                <div className="d-flex flex-column flex-shrink-0 p-3 text-dark bg-light"
                     id={"visualization"}>
                    <div style={this.makeGridStyle()}>
                        {this.Grid()}
                    </div>
                </div>
            </div>
        );
    }
}


export default Model;