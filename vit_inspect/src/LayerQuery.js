import React from "react";


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

        var percent = Math.floor(
            100 * cmp.requestCounter / cmp.props.model.params.num_layers
        );
        // Update the progress at each appropriate percentage:
        if (percent % 5 == 0 && cmp.prev_percent < percent){
            cmp.updateProgress(percent);
            cmp.prev_percent = percent;
        }
    }

    selectLayer = (layer_id) => {
        var cmp = this;
        if (this.state.selected_layer == layer_id){
            return;
        }

        // intercept layer selection to update local state:
        let label_str = "";
        cmp.setStateAsync({
            selected_layer: layer_id
        })
            .then(()=>{
                // Inform the model about the layer selection:
                cmp.props.pf.selectLayerAsync(layer_id);
            })
            .then(()=>{
                // Loading layer completed
                if (layer_id < this.props.model.params.num_layers){
                    label_str = `Layer ${layer_id}`;
                } else {
                    label_str = `All Layers`;
                }
                cmp.setStateAsync({
                    ...cmp.state,
                    progress_percentage: 100,
                    progress_label: label_str
                })
            })
            .then(()=>{
                console.log(`${label_str} loaded!`);
            });
    }


    makeList () {
        var list = [];
        var num_layers = this.props.model.params.num_layers;
        // handle undefined case (not initialized yet):
        if (typeof num_layers == 'undefined'){
            return <></>;
        }

        for (let l=0; l < num_layers + 1; l++) {
            list.push(
                <Layer
                    key={l}
                    id={l}
                    num_layers={num_layers}
                    click={this.selectLayer}
                />
            );
        }
        return list;
    };


}

class Layer extends React.Component{
    constructor(props) {
        super(props);
        this.state = {};
    }

    click = () => {
        this.props.click(this.props.id)
    }

    layerName() {
        if (this.props.id < this.props.num_layers) {
            return `Layer ${this.props.id} + 1`;
        } else {
            return "All Layers";
        }
    }

    render() {
        return (
            <li>
                <div
                    className="dropdown-item"
                    onClick={this.click}
                >
                    {this.layerName()}
                </div>
            </li>
        );
    }
}
export default LayerQuery;
