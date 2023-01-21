import React from "react";

class ModelItem extends React.Component {
    // TODO: This should be the main model and the only one. The
    //  modelSelector should inform THIS component to update its state.
    constructor(props) {
        super(props);
        this.state = {
        };
        this.fetchBatchBlobKey = this.fetchBatchBlobKey.bind(this);
    }


    componentDidMount() {
        this.fetchBatchBlobKey();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        /* This cmp is responsible to check if the Model cmp is updated, and
           if it did, to update its state that is not handled by the
           re-rendering.
           This cmp is responsible to:
           1. get the proper number of patch sizes and update the grid, (auto)
           2. load the src image for the batch,

         */

        // Check if user selected the same model as before:
        if ((this.props.model.run === prevProps.model.run) &&
            (this.props.model.tag === prevProps.model.tag)){
            // TODO: THIS DOES NOT MATTER, since they get props-updated on change.
            return;
        } else {
            // Here we need to fetch the new query batch image!
            this.fetchBatchBlobKey();

        }
    }

    render() {
        return (
            <>
                <a
                    className="list-group-item list-group-item-action active"
                    aria-current="true"
                    onClick={this.click}
                >
                    <div className={"row"}>
                        <div className={"col-8"}>
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
                        </div>
                        <div className={"col-4"}>
                            <img className={"img-thumbnail"}
                                 src={this.state.batch_img_url}
                                 style={{padding: "0"}}
                            />
                        </div>
                    </div>
                </a>
            </>
        );
    }

    //==========================================================================
    // Component functions
    //==========================================================================

    click = () => {
        console.log(`@ModelItem: User selected model
            run:${this.props.model.run}
            tag:${this.props.model.tag}`);
        this.props.selectModel(this.props.model.id);
    }

    async fetchBatchBlobKey() {
        var cmp = this;
        // Load asynchronously the batch image, by calling the Model's fetch:
        const batch_blob_key = await cmp.props.fetchImgBlobKey(
            cmp.props.model.run, cmp.props.model.tag, 0, ()=>{}
        );
        cmp.setState(
            {
                ...cmp.state,
                batch_blob_key: batch_blob_key,
                batch_img_url: `individualImage?blob_key=${batch_blob_key}`
            }
        );
    }

}
export default ModelItem;