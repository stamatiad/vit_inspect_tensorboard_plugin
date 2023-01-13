import React from "react";

class ModelItem extends React.Component {
    // TODO: This should be the main model and the only one. The
    //  modelSelector should inform THIS component to update its state.
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    click = () => {
        this.props.selectModel(this.props.model.id);
    }

    render() {
        return (
            <>
                <a
                    className="list-group-item list-group-item-action active"
                    aria-current="true"
                    onClick={this.click}
                >
                    <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">
                            Run: {this.props.model.run} Tag: {this.props.model.tag}
                        </h5>
                    </div>
                    <p className="mb-1">
                        <small>
                            Layers: {this.props.model.params.num_layers},
                            heads: {this.props.model.params.num_heads}
                        </small>
                    </p>
                </a>
            </>
        );
    }
}

export default ModelItem;