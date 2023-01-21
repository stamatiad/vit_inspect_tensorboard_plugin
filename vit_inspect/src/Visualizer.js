import React from "react";

class Visualizer extends React.Component {
    constructor(props) {
        super(props);
    }

    makeGridStyle() {
        // Generate the styles to be used in grid:
        return {
            display: "grid",
            gridTemplateRows: "repeat("+this.props.model.params.num_layers+", 1fr)",
            gridTemplateColumns: "repeat("+this.props.model.params.num_heads+", 1fr)"
        };
    }

    makeImgUrl(selected_layer, wid) {
        var attnw_arr = this.props.vi_params.attn_blob_key_arr;
        if (attnw_arr.length == 0){
            return "";
        } else {
            return `individualImage?blob_key=${attnw_arr[selected_layer][wid]}}`;
        }
    }

    Grid () {
        // Array of React Components:
        var grid = [];
        var num_layers = this.props.model.params.num_layers;
        var num_heads = this.props.model.params.num_heads;
        var total_tokens = Math.pow(this.props.model.params.len_in_patches, 2);
        var selected_layer = this.props.vi_params.selected_layer;
        var selected_token = this.props.vi_params.selected_token;
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
                        src={this.makeImgUrl(l, wid)}
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

class WeightsImg extends React.Component{
    constructor(props) {
        super(props);
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
                    <img className={"img-thumbnail"} src={this.props.src}/>
                </div>
            </>
        );
    }
}

export default Visualizer;