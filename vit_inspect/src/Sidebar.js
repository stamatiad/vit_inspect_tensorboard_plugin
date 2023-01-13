import React from "react";
import ModelSelector from "./ModelSelector";
import PixelQuery from "./PixelQuery";
import LayerQuery from "./LayerQuery";

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    updateParent(state) {
        // Passes the child state to the parent.
    }

    render(){
        console.log(`Rendering SIDEBAR`);
        return (
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
                 id={"sidebar"}>
                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <span className="fs-5">Visualization Method</span>
                </a>
                <hr/>
                <div>
                    <div className="btn-group-vertical w-100" role="group"
                         aria-label="Choose vizualization method.">
                        <div className="btn-group" role="group">
                            <input type="radio" className="btn-check" name="btnradio"
                                   id="btnradio1" autoComplete="off"/>
                            <label className="btn btn-outline-light"
                                   htmlFor="btnradio1">Paper 1</label>
                        </div>

                        <div className="btn-group" role="group">
                            <input type="radio" className="btn-check" name="btnradio"
                                   id="btnradio2" autoComplete="off"/>
                            <label className="btn btn-outline-light"
                                   htmlFor="btnradio2">Paper 2</label>
                        </div>

                        <div className="btn-group" role="group">
                            <input type="radio" className="btn-check" name="btnradio"
                                   id="btnradio3" autoComplete="off"/>
                            <label className="btn btn-outline-light"
                                   htmlFor="btnradio3">Paper 3</label>
                        </div>
                    </div>
                </div>
                <hr/>
                <ModelSelector
                    models_arr={this.props.models_arr}
                    selectModel={this.props.selectModel}
                    up={this.props.up}
                />
                <LayerQuery
                    model={this.props.model}
                    selectLayer={this.props.selectLayer}
                    fetchLayerMaps={this.props.fetchLayerMaps}
                    up={this.props.up}
                />
                <PixelQuery
                    //len_in_patches={this.props.len_in_patches}
                    model={this.props.model}
                    fetchImgBlobKey={this.props.fetchImgBlobKey}
                    queryPixel={this.props.queryPixel}
                    up={this.props.up}
                />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li>
                        <a href="#" className="nav-link text-white">
                            Dashboard
                        </a>
                    </li>
                </ul>
                <hr/>
                <div>
                    <p>stamatiad.st@gmail.com</p>
                </div>
            </div>
        );
    }
}

export default Sidebar;