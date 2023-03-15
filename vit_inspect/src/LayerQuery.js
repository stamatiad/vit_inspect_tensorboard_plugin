import React from "react";
import {Range} from "react-range";


class LayerQuery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // This is required to be an array by react-range:
            selected_layer: 1,
            values: [1],
            // The progress related state, will re-render the progress
            // button component, yet not this component.
            progress_percentage: 0,
            progress_label: "Select Layer"
        };
        this.selectLayer = this.selectLayer.bind(this);
    }

    render(){
        console.log(`Rendering LAYERQUERY`);
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

    selectLayer = (layer_id) => {
        // Since the usage of react-range, input layer_id is an array!
        var cmp = this;
        if (this.state.selected_layer == layer_id[0]){
            return;
        }

        // intercept layer selection to update local state:
        let label_str = "";
        cmp.setStateAsync({
            selected_layer: layer_id[0],
            values: layer_id
        })
            .then(()=>{
                // Inform the model about the layer selection:
                cmp.props.pf.selectLayerAsync(layer_id[0]);
            })
            .then(()=>{
                console.log(`${label_str} loaded!`);
            });
    }


    makeRangeSelectors () {
        var num_layers = this.props.model.params.num_layers;
        // handle undefined case (not initialized yet):
        if (typeof num_layers == 'undefined'){
            return <></>;
        } else {
            return (
                <Range
                    step={1}
                    min={1}
                    max={this.props.model.params.num_layers}
                    values={this.state.values}
                    onChange={this.selectLayer}
                    renderTrack={({ props, children }) => (
                        <div
                            {...props}
                            style={{
                                ...props.style,
                                height: '6px',
                                width: '100%',
                                backgroundColor: '#ccc'
                            }}
                        >
                            {children}
                        </div>
                    )}
                    renderThumb={({ props }) => (
                        <div
                            {...props}
                            style={{
                                ...props.style,
                                height: '42px',
                                width: '42px',
                                backgroundColor: '#999'
                            }}
                        />
                    )}
                />

            );
        }
    };


}

export default LayerQuery;
