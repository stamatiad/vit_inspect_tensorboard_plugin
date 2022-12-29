import React from "react";
import $ from "jquery";
// The import statement is for the webpack to know the dependence on
// external js/css files and to add them to the compiled output.
import '../static/js/bootstrap.min.js'
import '../static/css/bootstrap.min.css';
import '../static/css/main.css';

class WeightsImg extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            layer: props.layer,
            head: props.head,
            //src: "individualImage?blob_key=WyIiLCJpbWFnZXMiLCIuIiwiVmlUMTYiLDAsNV0"
            src: '/plugin/vit_inspect/individualImage?blob_key=WyIiLCIuIiwiVmlUMTYiLDAsM10'
        };
    }
    componentDidMount() {

    }

    render(){
        return (
            <div className="" id="weights-img"
                 style={{gridArea: `${this.state.layer} ${this.state.head} 
                 ${this.state.layer} ${this.state.head}`}}
            >
                <img className="img-thumbnail" src={this.state.src}/>
            </div>
        );
    }
}

class GridCell extends React.Component {
    // That's why:
    //https://stackoverflow.com/questions/29810914/react-js-onclick-cant-pass-value-to-method
    constructor(props) {
        super(props);
        this.state= {
            i: props.i,
            j: props.j,
            class_style: ""
        };
    }

    click = () => {
        this.props.select(this.state.i, this.state.j);
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
                {gridArea: `${this.state.i} ${this.state.j} ${this.state.i} ${this.state.j}`
                }
            }>
            </div>
        );
    }
}


class Tag extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            run: props.run,
            tag: props.tag,
            obj: props.obj,
            id: props.id,
            // Expand the model parameters for easy access:
            num_layers: props.obj.model_params.num_layers,
            num_heads: props.obj.model_params.num_heads,
            len_in_patches: props.obj.model_params.len_in_patches,
            batch_blob_key: null,
            attn_blob_key_arr: []
        };
    }

    fetchImgBlobKey(run, tag, sample){
        // Returns a promise!
        var url = `http://localhost:6006/data/plugin/vit_inspect/images?run=${run}&tag=${tag}&sample=${sample}`;
        const blob_key = fetch(url)
            .then((response) => {
                //TODO: how do you handlee/notice this error?
                if (!response.ok) {
                    throw new Error(
                        `HTTP error: ${response.status}\n\tFailed to fetch image from:\n\t${url}`
                    );
                }
                console.log("IMAGE FETCHED SUCCESSFULLY!")
                return response;
            })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                // Get the first and only sample, that is our image.
                return data[0].blob_key;
            })
            .catch((error) => {
                console.log(`Could not get image: \n\t${url}`);
                return null;
            });
        return blob_key;
    }

    fetchLayerMaps(layer){
        // returns a Promise!
        var cmp = this;
        const layer_maps = [];
        // SOS: We name differently the batch tags and the per layer tags!
        // E.g the 'b0' is the whole batch tag and the 'b0l2' is its layer 2
        // attention maps. So we need to change the tag string in the request!
        for (const i of Array(this.state.num_heads).keys()) {
            layer_maps.push(cmp.fetchImgBlobKey(
                this.props.run, `${this.props.tag}l${layer}`, i
            ))
        }
        return Promise.all(layer_maps);
    }

    click = async () => {
        // This will begin fetching the tag's metadata and inform the parent
        // Tags List that it is the selected/active tag.
        var cmp = this;
        console.log(`loading run: ${this.props.run}, tag: ${this.props.tag}, blob key: ${this.props.blob_key}`);
        // Inform the Tags List that this is the active tag that we inspect:
        this.props.click(this.props.run, this.props.tag, this.props.id);
        //TODO: Loads asynchronously the batch image and the attention maps
        // keys:
        const batch_blob_key = await cmp.fetchImgBlobKey(
            this.props.run, this.props.tag, 0
        );
        const attn_blob_key_arr = await cmp.fetchLayerMaps(0);
        console.log("TUTTO PRONTO!");
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
                            Run: {this.props.run} Tag: {this.props.tag}
                        </h5>
                    </div>
                    <p className="mb-1">
                        <small>
                            Layers: {this.state.obj.model_params["num_layers"]},
                            heads: {this.state.obj.model_params["num_heads"]}
                        </small>
                    </p>
                </a>
            </>
        );
    }
}

class AllTags extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tags_arr: [],
            active_tag_id: -1
        };
        this.activateTag = this.activateTag.bind(this);
    }

    componentDidMount() {
        var cmp = this;
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
                    tags_arr: all_tags
                }
            )
        }).fail(function (error) {
            console.log('Something went WRONG in fetching the dxf PARAMS from the server.', error);
            console.log(error);
        });
    }


    getRunsTags(dict) {
        var all_tags = [];

        for (const [run, run_obj] of Object.entries(dict)) {
            for (const [tag, tag_obj] of Object.entries(run_obj)) {
                // Change the tag object and restructure it, adding the
                // model params, yet keeping any custom description that
                // might exist.
                var to = tag_obj;
                var params = JSON.parse(tag_obj.description.slice(3, -4));
                //TODO: remember to add handling for empty description:
                //to.description = params.description;
                to.model_params = params;
                all_tags.push(
                    {
                        run: run, tag: tag,
                        obj: to,
                    }
                );
            }
        }
        return all_tags;
    }


    activateTag(run, tag, id) {
        // Marks this tag/run combo as the active tag to inspect.
        // Run and tag uniquely determine the attention maps to load.
        // key is the tags_arr index.
        var cmp = this;
        cmp.setState({active_tag_id: id});

    }

    renderTags() {
        var tag_list = [];
        for (const [i, entry] of Object.entries(this.state.tags_arr)) {
            tag_list.push(
                <Tag
                    run={entry.run} tag={entry.tag}
                    obj={entry.obj} id={i}
                    click={this.activateTag} key={i}
                />
            );
        }
        return tag_list;
    }

    createPixelQuery() {
        var grid_size = 1;
        if (this.state.active_tag_id > -1) {
            grid_size = this.state.tags_arr[this.state.active_tag_id]
                .obj.model_params.len_in_patches;
        }
        // If grid size is 1, the pixel query will know to render as inactive.
        return (<PixelQuery
            len_in_patches={grid_size}
        />);
    }

    render () {
        return(
            <>
                <div className="list-group overflow-auto">
                    {this.renderTags()}
                </div>
                {this.createPixelQuery()}
            </>
        )
    }
}

class PixelQuery extends React.Component {
    constructor(props) {
        super(props);
        // TODO: State needs to know what image/batch is this.
        this.state = {
            image_id: 0,
            len_in_patches: props.len_in_patches,
            grid: [],
            src: "individualImage?blob_key=WyIiLCIuIiwiVmlUMTYiLDAsNF0",
        };
        // Generate the styles to be used in grid:
        this.GridStyle = {
            display: "grid",
            gridTemplateRows: `repeat(${this.state.len_in_patches}, 1fr)`,
            gridTemplateColumns: `repeat(${this.state.len_in_patches}, 1fr)`,
            padding: "0.25rem"
        }
        // TODO: render as inactive if grid size is one!
    }



    componentDidMount() {
        //this.createQueryGrid();
    }

    selectQueryPixel(layer, head) {
        console.log(`Query pixel is ${layer} ${head}`);

    }

    Grid () {
        var grid = [];

        for (let i=0; i < this.state.len_in_patches; i++) {
            for (let j=0; j < this.state.len_in_patches; j++) {
                grid.push(
                    <GridCell key={i*12+j} i={i} j={j}
                              select={this.selectQueryPixel}/>
                );
            }
        }
        return grid;
    };

    render(){
        // TODO: make sure that always img-thumbnail and grid will
        // have the same padding!
        return (
            <div>
                <span className="fs-5">Pixel Query</span>
                <div className="pixelq-img" id="weights-img">
                    <img className="img-thumbnail" src={this.state.src} style={{padding: "0.25rem"}}/>
                    <div className="pixelq-grid" style={this.GridStyle}>
                        {
                            this.Grid()
                        }
                    </div>
                </div>
            </div>
        );
    }
}


function DashboardLayout() {
  return (
      <main>
          <Sidebar/>
          <WeightsImgGrid layers={12} heads={12}/>
      </main>
  );
}

function Sidebar() {
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
        <AllTags/>
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

class WeightsImgGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layers: props.layers,
            heads: props.heads
        };
        // Generate the styles to be used in grid:
        this.GridStyle = {
            display: "grid",
            gridTemplateRows: "repeat("+this.state.layers+", 1fr)",
            gridTemplateColumns: "repeat("+this.state.heads+", 1fr)"
        }
    }

    Grid () {
        // Array of React Components:
        var grid = [];

        for (let l=0; l < this.state.layers; l++) {
            for (let h=0; h < this.state.heads; h++) {
                grid.push(
                    <WeightsImg key={l*12+h} layer={l} head={h}/>
                );
            }
        }
        return grid;
    };

    render() {
        return (
            <div className="container-fluid">
                <div className="d-flex flex-column flex-shrink-0 p-3 text-dark bg-light"
                     id={"visualization"}>
                    <div style={this.GridStyle}>
                        {this.Grid()}
                    </div>
                </div>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        //this.addDebugger();
    }

    addDebugger() {
        //This fails because I can not get pass the CSP...
        var debuger_url = "http://localhost:8097";
        $.ajax(debuger_url, {
            method: "GET",
            crossDomain: true,
            contentType: "text/javascript",
            dataType: "json",
            xhrFields: {
              withCredentials: true
            }
            //headers: {'nonce': "blahdeblahsadf"}, // This is the magic line
        }).done(function (response) {
            console.log("PARAMS FETCHED SUCCESSFULLY!")
        }).fail(function (error) {
            console.log('Something went WRONG in fetching the dxf PARAMS from the server.', error);
            console.log(error);
        });
    }

    render(){
        return (
            <div className="App">
                <DashboardLayout/>
            </div>
        );
    }
}

export default App;