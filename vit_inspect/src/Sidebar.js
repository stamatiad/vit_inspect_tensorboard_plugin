import React from "react";
import ModelSelector from "./ModelSelector";
import PixelQuery from "./PixelQuery";
import LayerHeadQuery from "./LayerHeadQuery";

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    render(){
        console.log(`Rendering SIDEBAR`);
        return (
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
                 id={"sidebar"}>
                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <span className="fs-5">Visualization Method</span>
                </a>
                <div>
                    <div className="btn-group-vertical w-100" role="group"
                         aria-label="Choose vizualization method.">
                        <div className="btn-group" role="group">
                            <input type="radio" className="btn-check" name="btnradio"
                                   id="btnradio1" autoComplete="off"/>
                            <label className="btn btn-outline-light"
                                   htmlFor="btnradio1">Cordonnier and Jaggi</label>
                        </div>

                    </div>
                </div>
                <hr/>
                <ModelSelector
                    vi_params={this.props.vi_params}
                    pf={this.props.pf}
                />
                <hr/>
                <div>
                    <p>stamatiad.st@gmail.com</p>
                </div>
            </div>
        );
    }
}

export default Sidebar;