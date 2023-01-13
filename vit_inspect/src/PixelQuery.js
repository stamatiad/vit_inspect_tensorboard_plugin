import React from "react";

class GridCell extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            class_style: ""
        };
    }

    // That's why:
    //https://stackoverflow.com/questions/29810914/react-js-onclick-cant-pass-value-to-method
    click = () => {
        this.props.select(this.props.i, this.props.j);
    }
    over = () => {
        this.setState({class_style: "border border-danger shadow"})
    }
    out = () => {
        this.setState({class_style: ""})
    }

    render() {
        return (
            <div
                onClick={this.click}
                onMouseOver={this.over}
                onMouseOut={this.out}
                className={this.state.class_style}
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
            src: "individualImage?blob_key=WyIiLCIuIiwiVmlUMTYiLDAsNF0",
        };
        this.selectQueryPixel = this.selectQueryPixel.bind(this);
    }



    componentDidMount() {
        //this.createQueryGrid();
    }

    selectQueryPixel(i, j) {
        var cmp = this;
        //console.log(`Query pixel is ${i} ${j}`);
        // Update local state:
        this.setState({
            qi: i,
            qj: j
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
                grid.push(
                    <GridCell
                        key={i*len_in_patches+j}
                        i={i}
                        j={j}
                        select={this.selectQueryPixel}
                    />
                );
            }
        }
        return grid;
    };

    makeImgUrl() {
        return `individualImage?blob_key=${this.props.model.batch_blob_key}`;
    }

    render(){
        console.log(`Rendering PIXELQUERY`);
        // TODO: make sure that always img-thumbnail and grid will
        // have the same padding!
        return (
            <div>
                <span className="fs-5">Pixel Query</span>
                <div className="pixelq-img" id="weights-img">
                    <img className="img-thumbnail" src={this.makeImgUrl()} style={{padding: "0.25rem"}}/>
                    <div className="pixelq-grid" style={this.makeGridStyle()}>
                        {
                            this.makeGrid()
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default PixelQuery;