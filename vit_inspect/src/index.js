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

/*
export async function render() {
    // Append styles and js on the head element:
    const bcss = createElement('link');
    bcss.setAttribute("href", "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css");
    bcss.setAttribute("rel", "stylesheet");
    bcss.setAttribute("integrity", "sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65");
    bcss.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(bcss);

    const bjs = createElement('link');
    bjs.setAttribute("src", "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js");
    bjs.setAttribute("integrity", "sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4");
    bjs.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(bjs);

    // Custom sidebar css:
    // TODO: these should be generaged by React! We cannot buldle them,
    // because we shoulc alse create a GET target for them.
    const sbcss = createElement('link');
    sbcss.setAttribute("href", "css/sidebar.css");
    sbcss.setAttribute("rel", "stylesheet");
    document.head.appendChild(sbcss);



  const msg = createElement('p', 'Fetching data…');
  document.body.appendChild(msg);

  const runToTags = await fetch('./tags').then((response) => response.json());
  const data = await Promise.all(
    Object.entries(runToTags).flatMap(([run, tagToDescription]) =>
      Object.keys(tagToDescription).map((tag) =>
        fetch('./attn_weights?' + new URLSearchParams({run, tag}))
          .then((response) => response.json())
          .then((greetings) => ({
            run,
            tag,
            greetings,
            description: tagToDescription[tag].description,
          }))
      )
    )
  );

  const style = createElement(
    'style',
    `
      thead {
        border-bottom: 1px black solid;
        border-top: 2px black solid;
      }
      tbody {
        border-bottom: 2px black solid;
      }
      table {
        border-collapse: collapse;
      }
      td,
      th {
        padding: 2pt 8pt;
      }
    `
  );
  style.innerText = style.textContent;
  document.head.appendChild(style);

  const table = createElement('table', [
    createElement(
      'thead',
      createElement('tr', [
        createElement('th', 'Run'),
        createElement('th', 'Tag'),
        createElement('th', 'Greetings'),
        createElement('th', 'Description'),
      ])
    ),
    createElement(
      'tbody',
      data.flatMap(({run, tag, greetings, description}) =>
        greetings.map((guest, i) =>
          createElement('tr', [
            createElement('td', i === 0 ? run : null),
            createElement('td', i === 0 ? tag : null),
            createElement('td', guest),
            createElement('td', description),
          ])
        )
      )
    ),
  ]);
  msg.textContent = 'Data loaded.!!!';
  document.body.appendChild(table);
}

function createElement(tag, children) {
  const result = document.createElement(tag);
  if (children != null) {
    if (typeof children === 'string') {
      result.textContent = children;
    } else if (Array.isArray(children)) {
      for (const child of children) {
        result.appendChild(child);
      }
    } else {
      result.appendChild(children);
    }
  }
  return result;
}

 */



