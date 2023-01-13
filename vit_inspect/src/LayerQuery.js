import React from "react";


class LayerQuery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_layer: 0,
        };
        this.selectLayer = this.selectLayer.bind(this);
    }

    selectLayer = (layer_id) => {
        var cmp = this;
        // intercept layer selection to update local state:
        cmp.setState({selected_layer: layer_id});
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


    render(){
        console.log(`Rendering LAYERQUERY`);
        return (
            <div className={"btn-group-vertical w-100"}>
                <div className="dropdown btn-group">
                    <button className="btn btn-secondary dropdown-toggle"
                            type="button" id="layerDropdown"
                            data-bs-toggle="dropdown" aria-expanded="false">
                        Showing Layer {this.state.selected_layer}
                        <div className="progress">
                            <div className="progress-bar" role="progressbar"
                                 style={{width: "50%"}}>
                            </div>
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
