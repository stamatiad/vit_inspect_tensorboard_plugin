import React from "react";
import ModelSelector from "./ModelSelector";
import PixelQuery from "./PixelQuery";
import LayerQuery from "./LayerQuery";

class RightSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render(){
        console.log(`Rendering RIGHTSIDEBAR`);
        return (
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
                 id={"sidebar"}>
                <span className="fs-5"> Layer and Pixel Query</span>
                <LayerQuery
                    model={this.props.model}
                    pf={this.props.pf}
                />
                <PixelQuery
                    //len_in_patches={this.props.len_in_patches}
                    model={this.props.model}
                    pf={this.props.pf}
                    queryPixel={this.props.queryPixel}
                />
            </div>
        );
    }
}

export default RightSidebar;
