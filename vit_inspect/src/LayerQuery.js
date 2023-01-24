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
        this.selectLayer = this.selectLayer.bind(this);
    }

    render(){
        console.log(`Rendering LAYERQUERY`);
        return (
            <div className={"btn-group-vertical w-100"}>
                <div className="dropdown btn-group">
                    <button className="btn btn-outline-light dropdown-toggle"
                            type="button" id="layerDropdown"
                            data-bs-toggle="dropdown" aria-expanded="false">
                        {this.getLayerName()}
                    </button>
                    <ul className="dropdown-menu"
                        aria-labelledby="layerDropdown">
                        {this.makeList()}
                    </ul>
                </div>
            </div>
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
            return `Layer ${this.props.id}`;
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
