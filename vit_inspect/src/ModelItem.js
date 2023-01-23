import React from "react";

class ModelItem extends React.Component {
    // TODO: This should be the main model and the only one. The
    //  modelSelector should inform THIS component to update its state.
    constructor(props) {
        super(props);
        this.state = {
        };
        this.fetchBatchBlobKey = this.fetchBatchBlobKey.bind(this);
        this.click = this.click.bind(this);
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

    fetchLayerBlobKeysCallback() {
        console.log("CALLBACK");
    }

    fetchLayersBlobKeysAsync() {
        var cmp = this;
        // Load asynchronously the layers maps, by calling the Model's fetch:
        // IMPORTANT: initialize the counters:
        cmp.requestCounter = 0;
        cmp.prev_percent = 0;

        //TODO: rename to async to make explicit that it returns a promise.
        return cmp.props.pf.fetchLayerMapsAsync(
            cmp.props.model, cmp.fetchLayerBlobKeysCallback
        );

    }

    click() {
        var cmp = this;
        console.log(`@ModelItem: User selected model
            run:${this.props.model.run}
            tag:${this.props.model.tag}`);
        // TODO: something like this!
        // intercept layer selection to update local state:
        // TODO:update the model fitst, so everything refers to the
        //  proper model object.
        //  this.props.selectModel(this.props.model.id);
        cmp.props.pf.selectModelAsync(cmp.props.model.id)
            .then(()=>{
                console.log(`MODEL LOADED:
                run: ${cmp.props.model.run}, 
                tag: ${cmp.props.model.tag}`);
                // Returns promise array with elements the blob keys of each layer.
                return cmp.fetchLayersBlobKeysAsync();
            })
            .then((attn_arr)=>{
                //inform parent Model:
                return cmp.props.pf.loadAttnMapsToModelAsync(
                    attn_arr
                );
            })
            .then(()=>{
                // Loading layer completed
                cmp.setState({
                    progress_percentage: 100,
                    progress_label: `Layer ${cmp.state.selected_layer}.`
                }, ()=>{
                    console.log(`Layer ${cmp.state.selected_layer} loaded!`);
                });
            });

    }

    async fetchBatchBlobKey() {
        var cmp = this;
        // Load asynchronously the batch image, by calling the Model's fetch:
        const batch_blob_key = await cmp.props.pf.fetchImgBlobKey(
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