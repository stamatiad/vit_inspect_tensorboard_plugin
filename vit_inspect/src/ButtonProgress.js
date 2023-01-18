import React from "react";


class ButtonProgress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        console.log(`Rendering BUTTON PROGRESS`);
        return (
            <>
                <div className="progress-bar bg-warning" role="progressbar"
                     style={{
                         width: `${this.props.progress_percentage}%`,
                         height: "100%",
                         position: "absolute",
                         top: "0",
                         left: "0"
                     }}>
                </div>
                <div style={{position: "relative"}}>
                    {this.props.progress_label}
                </div>
            </>
        );
    }


    //==========================================================================
    // Component functions
    //==========================================================================
}

export default ButtonProgress;
