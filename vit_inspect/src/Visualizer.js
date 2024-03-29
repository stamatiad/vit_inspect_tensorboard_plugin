import React from "react";
import ProgressBar from "./ProgressBar";

class Visualizer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // On change, the component will re-render, along with the
            // progress bar.
            progress_percentage: 0,
        }
        /*
        This might be weird on the eye, yet variables in state obj WILL
         update the component. Manual updating is a deep rabbit hole:
        https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops
        So the following variables should not be in state and be kept under
         the microscope, should they update the component or not.
         */
        this.currentProgress = 0;
        this.imgmat_len = 0;

        // Use this to count progress of async operations:
        this.onMapLoadCallback = this.onMapLoadCallback.bind(this);
        this.setProgress = this.setProgress.bind(this);
    }


    render() {
        console.log(`Rendering VISUALIZER`);
        return (
            <>
                <div className="container-fluid">
                    <div className="progress" style={{height: "3px"}}>
                        <ProgressBar
                            percentage={this.state.progress_percentage}
                            position={"relative"}
                        />
                    </div>
                    <div className={"row"}>
                        <div className={"row"}>
                            <div>Preview: Heads</div>
                            <div className="d-flex flex-column flex-shrink-0 p-3 text-dark bg-light"
                                id={"preview-viz"}>
                                <div style={this.makeGridStyle()}>
                                    {this.makePreviewGrid()}
                                </div>
                            </div>
                        </div>
                        <div className={"row"}>
                            <div>Head</div>
                            <div className="d-flex flex-column flex-shrink-0 p-3 text-dark bg-light"
                                id={"focus-viz"}>
                                {this.makeFocusViz()}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    componentDidMount() {
        // Reset progress bar
        this.setProgress(0);
    }

    //==========================================================================
    // Props functions. These operate and return, based ONLY on component props.
    //==========================================================================

    //TODO: These need refactoring: just make one call inside makeGrid
    // (pre-render), so everything gets updated at the same time. And avoid
    // this yo-yo updating. My current issue is that currentProgress might
    // fail to get back to zero if user clicks onto another layer before the
    // previous load completes.
    GridParamsFromProps(){
        let num_layers = this.props.model.params.num_layers;
        let num_heads = this.props.model.params.num_heads;
        let selected_layer = this.props.vi_params.selected_layer;
        let selected_head = this.props.vi_params.selected_head;

        let start_layer = selected_layer;
        let end_layer = selected_layer + 1;
        // Handle user showing all layers:
        if (selected_layer == num_layers){
            start_layer = 0;
            end_layer = num_layers;
        }

        // Compute keys also. This way you can compare them and know which
        // ImageMats will you add, and which preexist.
        //TODO: maintain the display_bool functionality, inside this
        // function, even if it should be outside, in a dedicated function.
        let keys = [];
        let display_bool = [];
        for (let l=0; l < num_layers; l++) {
            keys.push([]);
            display_bool.push([]);
            for (let h = 0; h < num_heads; h++) {
                // Generate keys for all the ImageMats possible.
                keys[l].push(l * num_heads + h);
                // Then hide any unwanted layers:
                if (l >= start_layer && l < end_layer){
                    display_bool[l].push(true);
                } else {
                    display_bool[l].push(false);
                }
            }
        }
        //Keys are the id of the images, and display is the rendering bool
        // for each image of te grid.
        return [selected_layer, selected_head, keys, display_bool];
    }

    fromPropsMaxProgress(){
        /*
        This is an alternative to memoization.
         */
        let num_heads = this.props.model.params.num_heads;
        let [start_layer, end_layer,,] = this.GridParamsFromProps();

        //TODO: Here the progress should recompute and set state the
        // progress requirements. Here It gets the info from layer query cmp.
        //this.initProgress(0, (end_layer-start_layer)*num_heads);
        // Set current goal for progress, as instructed from updated cmp.props:
        let newMaxProgress = (end_layer-start_layer)*num_heads;
        //Proceed with gradually filling the progress bar.
        return newMaxProgress;
    }

    //==========================================================================
    // Component functions
    //==========================================================================

    setStateAsync = (newState) => {
        /*
        Use promisified state set in order to chain thens.
        */
        return new Promise((resolve) => this.setState(newState, resolve));
    }

    setProgress(current){
        /*
        This will set the progress, by setting the current progress.
        */
        let cmp = this;
        console.log(`Setting progress to ${current}`)
        cmp.currentProgress = current;
    }

    onMapLoadCallback() {
        var cmp = this;

        let newProgress = ++cmp.currentProgress;
        let percent = Math.floor(
            100 * newProgress / cmp.fromPropsMaxProgress()
        );
        console.log(`CurrentProgress: ${newProgress}, MaxProgress: ${cmp.fromPropsMaxProgress()}`);
        cmp.setStateAsync({
            ...cmp.state,
            progress_percentage: percent
        }).then(()=>{
            // If this is the LAST call, reset the progress bar
            if (cmp.currentProgress == cmp.fromPropsMaxProgress()){
                cmp.setProgress(0);
            }
        });
    }

    makeGridStyle() {
        // Generate the styles to be used in grid:
        // TODO: This needs to change for the show_all layers
        return {
            display: "grid",
            gridTemplateRows: "repeat("+1+", 1fr)",
            gridTemplateColumns: "repeat("+this.props.model.params.num_heads+", 1fr)"
        };
    }

    makeImgUrl(layer_id, head_id) {
        let selected_token = this.props.vi_params.selected_token;
        let attnw_arr = this.props.vi_params.attn_blob_key_arr;
        let total_tokens = Math.pow(this.props.model.params.len_in_patches, 2);
        // Iterate through heads and tokens that are delivered in one array
        // by the backend (for speed).
        let wid = head_id * total_tokens + selected_token;
        if (attnw_arr.length == 0){
            return "";
        } else {
            let blob_key = attnw_arr[layer_id][wid];
            return `individualImage?blob_key=${blob_key}`;
        }
    }

    makePreviewGrid () {
        let num_layers = this.props.model.params.num_layers;
        let num_heads = this.props.model.params.num_heads;
        let [selected_layer, selecetd_head, keys, display_bool] =
            this.GridParamsFromProps();

        // THIS IS A HACK: If new ImageMats to be rendered are more than the
        // previous, add the difference to the currentProgress.
        let imgmat_len = 0;
        for (let arr of display_bool){
            imgmat_len += arr.filter(Boolean).length;
        }
        if (this.imgmat_len < imgmat_len){
            this.currentProgress += this.imgmat_len;
            this.imgmat_len = imgmat_len;
        } else {
            this.imgmat_len = imgmat_len;
        }


        // Array of React Components:
        var grid = [];

        if ((typeof num_layers == 'undefined') || (typeof num_heads == 'undefined')){
            return <></>;
        }

        //TODO: this should render as a grid only if user selects to show
        // all layers. Else should render as a line.

        //TODO: I maintain this rance only for the 'show all layers'
        // functionality.
        var start_layer = selected_layer;
        var end_layer = selected_layer + 1;
        for (let l=start_layer; l < end_layer; l++) {
            for (let h=0; h < num_heads; h++) {
                // Get the weight mat id:
                // TODO: adapt to the selection of a single layer
                //var wid = (l*num_heads+h) * total_tokens + selected_token;
                //TODO: you should fetchLayerMaps() again, since we are
                // changing layer!

                //var wid = l * num_heads + h;
                let is_active = h == this.props.vi_params.selected_head ? true: false;
                grid.push(
                    <MapPreview
                        key={keys[l][h]}
                        display={display_bool[l][h]}
                        layer={l}
                        head={h}
                        src={this.makeImgUrl(l,h)}
                        active={is_active}
                        onLoadCallback={this.onMapLoadCallback}
                    />
                );
            }
        }
        return grid;
    };

    makeFocusViz () {
        let num_layers = this.props.model.params.num_layers;
        let num_heads = this.props.model.params.num_heads;
        let [selected_layer, selected_head, keys, display_bool] =
            this.GridParamsFromProps();

        // Array of React Components:
        var grid = [];

        if ((typeof num_layers == 'undefined') || (typeof num_heads == 'undefined')){
            return <></>;
        }

        //TODO: this should render as a grid only if user selects to show
        // all layers. Else should render as a line.

        // Get the weight mat id:
        // TODO: adapt to the selection of a single layer
        //var wid = (l*num_heads+h) * total_tokens + selected_token;
        //TODO: you should fetchLayerMaps() again, since we are
        // changing layer!

        //var wid = l * num_heads + h;
        //TODO: the head_id is undefined. check it out.
        grid.push(
            <ImageFocusMap
                key={keys[selected_layer][selected_head]}
                display={display_bool[selected_layer][selected_head]}
                layer={selected_layer}
                head={selected_head}
                src={this.makeImgUrl(selected_layer,selected_head)}
            />
        );
        return grid;
    };

}

class MapPreview extends React.Component{
    constructor(props) {
        super(props);
        this.img = React.createRef();
    }

    render(){
        return (
            <>
                <div className="" id="weights-img"
                     style={{
                         gridArea: `${this.props.layer} ${this.props.head} 
                             ${this.props.layer} ${this.props.head}`,
                         display: this.props.display,
                         minWidth: "0"
                }}
                >
                    <img
                        className={"preview-thumbnail"}
                        style={this.fromStateGetStyle()}
                        src={this.props.src}
                        ref={this.img}
                    />
                </div>
            </>
        );
    }

    componentDidMount() {
        this.img.current.onload =
            ()=>{
                this.props.onLoadCallback();
            }
    }

    //==========================================================================
    // Props functions. These operate and return, based ONLY on component props.
    //==========================================================================

    fromPropsGetDisplay(){
        if (this.props.display) {
            return "block";
        } else {
            return "none";
        }
    }

    fromStateGetStyle(){
        if (this.props.active) {
            return {borderColor: "red"};
        } else {
            return {};
        }

    }
}

class ImageFocusMap extends React.Component{
    constructor(props) {
        super(props);
        this.img = React.createRef();
    }

    render(){
        return (
            <>
                <div className="" id="weights-img"
                     style={{
                         display: this.props.display,
                         minWidth: "0"
                     }}
                >
                <img
                    className={"img-thumbnail"}
                    src={this.props.src}
                    ref={this.img}
                />
                </div>
            </>
        );
    }

    componentDidMount() {
    }

    //==========================================================================
    // Props functions. These operate and return, based ONLY on component props.
    //==========================================================================

    fromPropsGetDisplay(){
        if (this.props.display) {
            return "block";
        } else {
            return "none";
        }
    }
}

export default Visualizer;