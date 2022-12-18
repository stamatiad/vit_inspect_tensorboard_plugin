import React from "react";
// The import statement is for the webpack to know the dependence on
// external js/css files and to add them to the compiled output.
import '../static/js/bootstrap.min.js'
import '../static/css/bootstrap.min.css';
import '../static/css/main.css';

class TbImage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
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
        <span className="fs-4">Method</span>
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
            arr.push(<TbImage layer={l} head={h}/>);
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

function App() {
  return (
    <div className="App">
          <TbDashboardLayout/>
    </div>
  );
}

export default App;