import React from "react";


class ProgressBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log(`Rendering BUTTON PROGRESS`);
        return (
            <>
                <div className="progress-bar bg-info" role="progressbar"
                     style={{
                         width: `${this.props.percentage}%`,
                         height: "100%",
                         position: this.props.position,
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

export default ProgressBar;
