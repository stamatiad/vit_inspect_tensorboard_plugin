import React from "react";

class GridCell extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            class_style: (props.selected ? "border border-primary shadow" : "")
        };
    }

    // That's why:
    //https://stackoverflow.com/questions/29810914/react-js-onclick-cant-pass-value-to-method
    click = () => {
        this.props.select(this.props.i, this.props.j);
    }

    /* Component maintains local control if its hovered uppon. Yet the
     selected state is kept by the parent PixelQuery.
     */
    over = () => {
        this.setState({class_style: "border border-danger shadow"})
    }
    out = () => {
        this.setState({class_style: ""})
    }

    setClassStyle() {
        if (this.props.selected){
            return "border border-primary shadow";
        } else {
            return this.state.class_style;
        }
    }

    render() {

        console.log(`rendering GridCell i${this.props.i} j${this.props.j}, str:${this.class_style}`);

        return (
            <div
                onClick={this.click}
                onMouseOver={this.over}
                onMouseOut={this.out}
                className={this.setClassStyle()}
                style={
                    {gridArea: `${this.props.i} ${this.props.j} ${this.props.i} ${this.props.j}`
                    }
                }>
            </div>
        );
    }
}

class PixelQuery extends React.Component {
    constructor(props) {
        super(props);
        // TODO: State needs to know what image/batch is this.
        this.state = {
            qi: 0,
            qj: 0,
            batch_blob_key: "",
            batch_img_url: ""
        };
        this.selectQueryPixel = this.selectQueryPixel.bind(this);
        this.fetchBatchBlobKey = this.fetchBatchBlobKey.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // Check if user selected the same model as before:
        if ((this.props.model.run === nextProps.model.run) &&
            (this.props.model.tag === nextProps.model.tag)){
            // TODO: THIS DOES NOT MATTER, since they get props-updated on change.
            // TODO: MAKE SURE that component updates after state change
            //  also! Because the batch img changes the state!!!
            return true;
        } else {
            return true;
        }
    }

    render(){
        console.log(`Rendering PIXELQUERY`);
        // TODO: make sure that always img-thumbnail and grid will
        // have the same padding!
        return (
            <div>
                <span className="fs-5">Pixel Query</span>
                <div className="pixelq-img" id="weights-img">
                    <img className="img-thumbnail" src={this.state.batch_img_url}
                         style={{padding: "0.25rem"}}/>
                    <div className="pixelq-grid" style={this.makeGridStyle()}>
                        {
                            this.makeGrid()
                        }
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        //this.createQueryGrid();
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

    //==========================================================================
    // Component functions
    //==========================================================================

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

    selectQueryPixel(i, j) {
        var cmp = this;
        console.log(`PixelQuery.selectQueryPixel called ${i} ${j}`);
        // Update local state:
        this.setState({
            ...cmp.state,
            qi: i,
            qj: j
        },()=>{
            cmp.forceUpdate();
        });
        // Notify selected model.
        cmp.props.queryPixel(i, j);

    }

    // Generate the styles to be used in grid:
    makeGridStyle() {
        return {
            display: "grid",
            gridTemplateRows: `repeat(${this.props.model.params.len_in_patches}, 1fr)`,
            gridTemplateColumns: `repeat(${this.props.model.params.len_in_patches}, 1fr)`,
            padding: "0.25rem"
        };
    }

    makeGrid () {
        var grid = [];
        var len_in_patches = this.props.model.params.len_in_patches;
        // handle undefined case (not initialized yet):
        if (typeof len_in_patches == 'undefined'){
            return <></>;
        }

        for (let i=0; i < len_in_patches; i++) {
            for (let j=0; j < len_in_patches; j++) {
                var selected = (this.state.qi == i && this.state.qj == j ? true : false);
                console.log(`i${i}, j${j}, s${selected}`);
                grid.push(
                    <GridCell
                        key={i*len_in_patches+j}
                        i={i}
                        j={j}
                        selected={selected}
                        select={this.selectQueryPixel}
                    />
                );
            }
        }
        return grid;
    };

}

export default PixelQuery;