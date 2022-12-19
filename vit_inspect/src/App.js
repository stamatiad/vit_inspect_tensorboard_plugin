import React from "react";
import $ from "jquery";
// The import statement is for the webpack to know the dependence on
// external js/css files and to add them to the compiled output.
import '../static/js/bootstrap.min.js'
import '../static/css/bootstrap.min.css';
import '../static/css/main.css';

class TbImage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            key: 0,
            layer: 1,
            head: 1,
            src: "individualImage?blob_key=WyIiLCJpbWFnZXMiLCIuIiwiVmlUMTYiLDAsNV0"
        };
    }
    componentDidMount() {

    }

    render(){
        return (
            <div className="" id="weights-img">
                <img className="img-thumbnail" src={this.state.src}/>
            </div>
        );
    }
}
/*
//className="pixelq-col"
class Row extends React.Component{
    constructor(props) {
        super(props);
        console.log("ROW CONSTRUCTOR");
    }
    render() {
        console.log("ROW RENDER");
        return (
            <div className="row g-0">
                That's a row, yo!
                {this.props.children}
            </div>
        );
    }
};
class Col extends React.Component{
    constructor(props) {
        super(props);
        console.log("COL CONSTRUCTOR");
    }
    render() {
        console.log("COL RENDER");
        return (<div>I'm a column!</div>);
    }
};

 */
class GridCell extends React.Component {
    // That's why:
    //https://stackoverflow.com/questions/29810914/react-js-onclick-cant-pass-value-to-method
    constructor(props) {
        super(props);
        this.state= {
            l: props.layer,
            h: props.head,
        };
    }

    click = () => {
        this.props.select(this.state.l, this.state.h);
    }

    render() {
        return (
            <div
                onClick={this.click}
                style={
                {gridArea: `${this.state.l} ${this.state.h} ${this.state.l} ${this.state.h}`}
            }>
            </div>
        );
    }
}

class TbPixelQuery extends React.Component {
    constructor(props) {
        super(props);
        // TODO: State needs to know what image/batch is this.
        this.state = {
            image_id: 0,
            layers: props.layers,
            heads: props.heads,
            grid: [],
            src: "individualImage?blob_key=WyIiLCIuIiwiVmlUMTYiLDAsNF0",
        };
        // Generate the styles to be used in grid:
        this.GridStyle = {
            display: "grid",
            gridTemplateRows: "repeat("+this.state.layers+", 1fr)",
            gridTemplateColumns: "repeat("+this.state.heads+", 1fr)"
        }
    }



    componentDidMount() {
        //this.createQueryGrid();
    }

    selectQueryPixel(layer, head) {
        console.log(`Query pixel is ${layer} ${head}`);

    }

    Grid () {
        var grid = [];

        for (let l=0; l < this.state.layers; l++) {
            for (let h=0; h < this.state.heads; h++) {
                grid.push(
                    <GridCell layer={l} head={h} select={this.selectQueryPixel}/>
                );
            }
        }
        return grid;
    };


    createQueryGrid() {
        // Create the grid to enable pixel query visualization.
        function Row(props) {
            return (
                <div className="row g-0">
                    {props.children}
                </div>
            );
        };
        function Col() {
            return (
                <div className="pixelq-col">

                </div>
            );
        };
        var grid = [];
        //var col = (<Col key={0}/>);

        for (let l=0; l < this.state.layers; l++) {
            var tmp = [];
            for (let h=0; h < this.state.heads; h++) {
                tmp.push(
                    <Col key={h}/>
                );
            }
            grid.push(
                <Row key={l}>{tmp}</Row>
            );
        }

        // Update the state with the created grid:
        this.setState(
            {
                grid: grid
            }
        );
    }

    render(){
        return (
            <div>
                <span className="fs-5">Pixel Query</span>
                <div className="pixelq-img" id="weights-img">
                    <img className="img-thumbnail" src={this.state.src}/>
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


function TbDashboardLayout() {
  return (
      <main>
          <TbSidebar></TbSidebar>
          <TbVizualization></TbVizualization>
      </main>
  );
}

function TbSidebar() {
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
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
            <span className="fs-5">Parameters</span>
        </a>
        <TbPixelQuery layers={7} heads={7}/>
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

function TbVizualization() {
    const arr = [];
    for (let l=0; l < 4; l++) {
        for (let h=0; h < 4; h++) {
            arr.push(<TbImage key={l*12+h} layer={l} head={h}/>);
        }
    }
    return (
        <div className="container-fluid">
            <div className="d-flex flex-column flex-shrink-0 p-3 text-dark bg-light"
             id={"visualization"}>
                {arr}
            </div>
        </div>
    );
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
                <TbDashboardLayout/>
            </div>
        );
    }
}

export default App;