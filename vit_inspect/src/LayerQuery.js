import React from "react";


class LayerQuery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_layer: 0,
        };
        this.selectLayer = this.selectLayer.bind(this);
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
            return false;
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
                        <div className="progress-bar bg-warning" role="progressbar"
                             style={{
                                 width: "50%",
                                 height: "100%",
                                 position: "absolute",
                                 top: "0",
                                 left: "0"
                             }}>
                        </div>
                        <div style={{position: "relative"}}>
                            Showing Layer {this.state.selected_layer}
                        </div>
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

    async fetchLayerBlobKeys() {
        var cmp = this;
        // Load asynchronously the layers maps, by calling the Model's fetch:
        // TODO: Check where you can save the Promise progress...
        const attn_blob_key_arr = cmp.props.model.attn_blob_key_arr;
        attn_blob_key_arr[this.state.selected_layer] = await cmp.props.fetchLayerMaps(
            cmp.props.model, cmp.state.selected_layer
        );
    }

    selectLayer = (layer_id) => {
        var cmp = this;
        // intercept layer selection to update local state:
        cmp.setState({selected_layer: layer_id});
        //TODO: load the layer blobs, displaying progress in the way. Then
        // pass the updated blobs to the Model component. Then cause the
        // Visualizer to re-render, displaying the attention maps.
        cmp.fetchLayerBlobKeys();

        //inform parent Model:
        cmp.props.selectLayer(layer_id);
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
