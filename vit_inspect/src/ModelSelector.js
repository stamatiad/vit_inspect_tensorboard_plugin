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
        for (const [i, model] of Object.entries(cmp.props.models_arr)) {
            model_list.push(
                <ModelItem
                    key={i}
                    model={model}
                    selectModel={cmp.props.selectModel}
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