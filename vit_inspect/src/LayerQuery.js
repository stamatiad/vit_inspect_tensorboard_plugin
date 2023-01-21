import React from "react";
import ButtonProgress from "./ButtonProgress";


class LayerQuery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_layer: -1,
            // The progress related state, will re-render the progress
            // button component, yet not this component.
            progress_percentage: 0,
            progress_label: "Select Layer"
        };
        this.requestCounter = 0;
        this.progress = React.createRef();
        this.selectLayer = this.selectLayer.bind(this);
        this.fetchLayerBlobKeysCallback = this.fetchLayerBlobKeysCallback.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        /* Avoids re-rendering the component if it does not depend on the
         blob_key arrays that take forever to load.
         */

        // Here we want the component to update, to have the updated info on
        // what layers we have already loaded.
        // TODO: FIRST MAKE SURE THAT YOU CAN load ALL the layers in the
        //  browser, then fiddle with labeling layers etc.

        // Check if user selected the same model as before:
        if ((this.props.model.run === nextProps.model.run) &&
            (this.props.model.tag === nextProps.model.tag)){
            // TODO: THIS DOES NOT MATTER, since they get props-updated on change.
            return true;
        } else {
            return true;
        }
    }

    render(){
        console.log(`Rendering LAYERQUERY`);
        return (
            <div className={"btn-group-vertical w-100"}>
                <div className="dropdown btn-group">
                    <button className="btn btn-outline-light dropdown-toggle"
                            type="button" id="layerDropdown"
                            data-bs-toggle="dropdown" aria-expanded="false">
                        <ButtonProgress
                            progress_label={this.state.progress_label}
                            progress_percentage={this.state.progress_percentage}
                        />
                    </button>
                    <ul className="dropdown-menu"
                        aria-labelledby="layerDropdown">
                        {this.makeList()}
                    </ul>
                </div>
            </div>
        );
    }

    componentDidUpdate() {
        /* This cmp is responsible to check if the Model cmp is updated, and
           if it did, to update its state that is not handled by the
           re-rendering.
           This cmp is responsible to:
           1. get the proper number of layers and update its layers list, (auto)
           2. load the first layer if its not already loaded.

         */




        // Layer load should be triggered only from here.
        // Can I do this? THIS WORKS: check if the parent Model is empty. If
        // it is not,
        // when it causes this cmp to render, I trigger a layer load.
        // So The model does NOT handle the blob loading, but this cmp gets
        // informed imetiatelly on model load/update, so to initiate the
        // first layer fetching.
        if (typeof this.props.model.params.num_layers != "undefined"){
            console.log("MODEL SEEN AS ACTIVE FROM LAYERQUERY")
            //inform parent Model:
            //this.props.selectLayer(0);
        } else {
            console.log("MODEL SEEN AS INACTIVE FROM LAYERQUERY")
        }
    }

    //==========================================================================
    // Component functions
    //==========================================================================

    setStateAsync = (newState) => {
        /*
        Use promisified state set in order to chain thens.
        */
        return new Promise((resolve) => this.setState(newState, resolve));
    }

    updateProgress(percent) {
        /*
        Update the style of the progres bar, without re-rendering the whole
        component.
        */
        /*
        function newPercentage(percent) {
            return {
                width: `${percent}%`,
                height: "100%",
                position: "absolute",
                top: "0",
                left: "0"
            }
        };
        // Update the style of the progress bar
        this.progress.current.style = newPercentage(percent);

         */
        this.setState({
            progress_percentage: percent,
            progress_label: `Loading Layer ${this.state.selected_layer}: ${this.state.progress_percentage}%.`
        }, ()=>{
            console.log(`Loading layer: ${percent}%.`);
        });
    }

    fetchLayerBlobKeysCallback() {
        /*
        Calculates the percentage of the layer that was loaded so far.
        Updates the progress at given percentage.
        */
        var cmp = this;

        cmp.requestCounter++;

        const num_heads = cmp.props.model.params.num_heads;
        const len_in_patches = cmp.props.model.params.len_in_patches;
        const total_tokens = len_in_patches * len_in_patches;
        const num_requests = total_tokens * num_heads;
        var percent = Math.floor(100 * cmp.requestCounter / num_requests);
        // Update the progress at each appropriate percentage:
        if (percent % 5 == 0 && cmp.prev_percent < percent){
            cmp.updateProgress(percent);
            cmp.prev_percent = percent;
        }
    }

    fetchLayerBlobKeysAsync() {
        var cmp = this;
        // Load asynchronously the layers maps, by calling the Model's fetch:
        // IMPORTANT: initialize the counters:
        cmp.requestCounter = 0;
        cmp.prev_percent = 0;


        //TODO: rename to async to make explicit that it returns a promise.
        return cmp.props.fetchLayerMaps(
            cmp.props.model, cmp.state.selected_layer, cmp.fetchLayerBlobKeysCallback
        );

    }

    selectLayer = (layer_id) => {
        var cmp = this;
        if (this.state.selected_layer == layer_id){
            return;
        }

        // intercept layer selection to update local state:
        cmp.setStateAsync({
            selected_layer: layer_id
        })
        .then(()=>{
            return cmp.fetchLayerBlobKeysAsync();
        })
        .then((attn_arr)=>{
            //inform parent Model:
            return cmp.props.selectLayerAsync(
                layer_id,
                attn_arr
            );
        })
        .then(()=>{
            // Loading layer completed
            cmp.setState({
                progress_percentage: 100,
                progress_label: `Layer ${cmp.state.selected_layer}.`
            }, ()=>{
                console.log(`Layer ${cmp.state.selected_layer} loaded!`);
            });
        });

        /*
        cmp.setState({
            selected_layer: layer_id
        }, ()=>{
            //TODO: load the layer blobs, displaying progress in the way. Then
            // pass the updated blobs to the Model component. Then cause the
            // Visualizer to re-render, displaying the attention maps.
            cmp.fetchLayerBlobKeysAsync();

            //inform parent Model:
            cmp.props.selectLayer(layer_id);
        });

         */
    }


    makeList () {
        var list = [];
        var num_layers = this.props.model.params.num_layers;
        // handle undefined case (not initialized yet):
        if (typeof num_layers == 'undefined'){
            return <></>;
        }

        for (let l=0; l < num_layers; l++) {
            list.push(
                <Element
                    key={l}
                    id={l}
                    click={this.selectLayer}
                />
            );
        }
        return list;
    };


}

class Element extends React.Component{
    constructor(props) {
        super(props);
        this.state = {};
    }

    click = () => {
        this.props.click(this.props.id)
    }

    render() {
        return (
            <li>
                <div
                    className="dropdown-item"
                    onClick={this.click}
                >
                    Layer {this.props.id}
                </div>
            </li>
        );
    }
}
export default LayerQuery;
