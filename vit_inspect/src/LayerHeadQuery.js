import React from "react";
import {Range} from "react-range";


class LayerHeadQuery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // This is required to be an array by react-range:
            selected_layer: 1,
            selected_head: 1,
            // The progress related state, will re-render the progress
            // button component, yet not this component.
            progress_percentage: 0,
            progress_label: "Select Layer"
        };
        this.selectLayer = this.selectLayer.bind(this);
        this.selectHead = this.selectHead.bind(this);
    }

    render(){
        console.log(`Rendering LAYERHEADQUERY`);
        return (
            <>
                {this.makeRangeSelectors()}
            </>
        );
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

    getLayerName(){
        if (this.state.selected_layer < this.props.model.params.num_layers){
            return `Layer ${this.state.selected_layer}`;
        } else {
            return `All Layers`;
        }
    }

    selectLayer = (event) => {
        // Since the usage of react-range, input layer_id is an array!
        var cmp = this;
        var layer_id = parseInt(event.target.value);
        if (this.state.selected_layer == layer_id){
            return;
        }

        // intercept layer selection to update local state:
        let label_str = "";
        cmp.setStateAsync({
            selected_layer: layer_id,
        })
            .then(()=>{
                // Inform the model about the layer selection:
                cmp.props.pf.selectLayerAsync(layer_id);
            })
            .then(()=>{
                console.log(`Layer ${label_str} loaded!`);
            });
    }

    selectHead = (event) => {
        // Since the usage of react-range, input layer_id is an array!
        var cmp = this;
        var head_id = parseInt(event.target.value);
        if (this.state.selected_head == head_id){
            return;
        }

        // intercept layer selection to update local state:
        let label_str = "";
        cmp.setStateAsync({
            selected_head: head_id,
        })
            .then(()=>{
                // Inform the model about the head selection:
                cmp.props.pf.selectHeadAsync(head_id);
            })
            .then(()=>{
                console.log(`Head ${label_str} loaded!`);
            });
    }

    makeRangeSelectors () {
        var num_layers = this.props.model.params.num_layers;
        // handle undefined case (not initialized yet):
        if (typeof num_layers == 'undefined'){
            return <></>;
        } else {
            return (
                <div>
                    <label
                        htmlFor="layerSelector"
                        className="form-label">
                        Select Layer
                    </label>
                    <input
                        id={"layerSelector"}
                        type={"range"}
                        onChange={this.selectLayer}
                        step={1}
                        min={0}
                        max={this.props.model.params.num_layers-1}
                        value={this.state.selected_layer}
                    />
                    <label
                        htmlFor="headSelector"
                        className="form-label">
                        Select Head
                    </label>
                    <input
                        id={"headSelector"}
                        type={"range"}
                        onChange={this.selectHead}
                        step={1}
                        min={0}
                        max={this.props.model.params.num_heads-1}
                        value={this.state.selected_head}
                    />
                </div>

            );
        }
    };


}

export default LayerHeadQuery;
