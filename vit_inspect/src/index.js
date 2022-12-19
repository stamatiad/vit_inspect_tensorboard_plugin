import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
//import ReactDOM from "@types/react-dom/client";
//import React from "@types/react";


export async function render() {

    /*
    const main_css = document.createElement('link');
    main_css.setAttribute("href", "main.css");
    main_css.setAttribute("rel", "stylesheet");
    main_css.setAttribute("type", "text/css");
    document.head.appendChild(main_css);
     */


    // Create the root element for our React app:
    const root_element = document.createElement("div");
    root_element.setAttribute("id", "root")
    document.body.appendChild(root_element);

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
