import React from "react";
import ModelItem from "./ModelItem";
import PixelQuery from "./PixelQuery";

class ModelSelector extends React.Component {
    // Prompts user to select a model tag, then informs Main component for
    // its model params.
    constructor(props) {
        super(props);
        this.state = {
            active_model_id: -1
        };
        this.renderModelList = this.renderModelList.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        /* This cmp is responsible to check if the Model cmp is updated, and
           if it did, to update its state that is not handled by the
           re-rendering.
           This cmp is responsible to:
           1. get the proper number of patch sizes and update the grid,
           2. load the src image for the batch,

         */
    }

    componentDidMount() {
        /*
        // Get images' tags on load:
        var debuger_url = "http://localhost:6006/data/plugin/vit_inspect/tags";

        $.ajax(debuger_url, {
            method: "GET",
            crossDomain: true,
            contentType: "text/javascript",
            dataType: "json",
            xhrFields: {
                withCredentials: true
            }
        }).done(function (response) {
            console.log(response);
            console.log("Tags fetched successfully");
            var all_tags = cmp.getRunsTags(response);
            cmp.setState(
                {
                    models_arr: all_tags
                }
            )
        }).fail(function (error) {
            console.log('Something went WRONG in fetching the dxf PARAMS from the server.', error);
            console.log(error);
        });

         */
    }

    renderModelList() {
        var cmp = this;
        var model_list = [];
        // TODO: model.id and key should be the same. Should I assert this??
        for (const [i, model] of Object.entries(cmp.props.vi_params.models_arr)) {
            model_list.push(
                <ModelItem
                    key={i}
                    model={model}
                    pf={this.props.pf}
                />
            );
        }
        return model_list;
    }

    render () {
        console.log(`Rendering MODELS LIST`);
        return(
            <>
                <div className="list-group overflow-auto">
                    {this.renderModelList()}
                </div>
            </>
        )
    }
}

export default ModelSelector;