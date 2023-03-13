// TODO: Enable theme context
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Quill } from "react-quill";
import ResizeAction from "quill-blot-formatter/dist/actions/ResizeAction";
import ImageSpec from "quill-blot-formatter/dist/specs/ImageSpec";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
/* import { ThemeContext } from '@truviz/shadow/dist/Components/Editor/Components/ThemeContext'; */
import { adjoinRGB, splitRGB } from "./methods";

function insertDataValues(args) {
  console.log("insertDataValues", args);
  const value = args;
  const cursorPosition = this.quill.getSelection().index;
  this.quill.insertEmbed(cursorPosition, "span-embed", value);

  this.quill.setSelection(cursorPosition + value.length + 1);
}

function openLinkEditor() {
  (document.querySelector(".annotation-link-editor-wrapper") as HTMLElement).style.display = "block";
}

function addLink(args) {
  (document.querySelector(".annotation-link-editor-wrapper") as HTMLElement).style.display = "block";
  const cursorPosition = this.quill.getSelection().index;
  let linkTitleInput = document.querySelector("#annotation-link-title") as HTMLInputElement;
  let linkAddressInput = document.querySelector("#annotation-link-address") as HTMLInputElement;
  this.quill.insertText(cursorPosition, linkTitleInput.value, "user");
  this.quill.setSelection(cursorPosition, linkTitleInput.value.length);
  this.quill.theme.tooltip.edit("link", linkAddressInput.value);
  this.quill.theme.tooltip.save();
  this.quill.setSelection(cursorPosition + linkTitleInput.value.length + 1);
  (document.querySelector(".annotation-link-editor-wrapper") as HTMLElement).style.display = "none";
  linkTitleInput.value = "";
  linkAddressInput.value = "";
}

// export const LinkEditor = (addLinkInEditor, closeEditor) => {
//   return (
//     // <div className="link-editor-container">
//     //   <label htmlFor="annotation-link-title">Title</label> <input type="text" id="annotation-link-title" placeholder="Text to display"/><br />
//     //   <label htmlFor="annotation-link-address">Address</label> <input type="text" id="annotation-link-address" placeholder="https://"/><br />
//     //   <button id="annotation-link-ok-btn" onClick={() => addLinkInEditor()}>OK</button>
//     //   <button id="annotation-link-ok-btn" onClick={() => closeEditor()}>Cancel</button>
//     // </div>
//   )
// };

class CustomImageSpec extends ImageSpec {
  getActions() {
    return [ResizeAction];
  }
}

// Modules object for setting up the Quill editor
export const modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {
      insertDataValues: insertDataValues,
      link: addLink,
    },
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
  blotFormatter: {
    specs: [CustomImageSpec],
  },
  /* imageActions: {},
  imageFormats: {}, */
  /* imageResize: {
    handleStyles: {
      backgroundColor: 'black',
      border: 'none',
      color: 'white',
    },
    modules: ['Resize', 'DisplaySize', 'Toolbar'],
  }, */
};

// Formats objects for setting up the Quill editor
export const formats = [
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "script",
  "background",
  "list",
  "bullet",
  "link",
  "image",
  "color",
  "code-block",
  "span-embed",
  "align",
  "float",
];

// Quill Toolbar component
export const QuillToolbar = ({ columns, currentAnnotation, handleChange }) => {
  const [backgroundColor, setBackgroundColor] = React.useState(currentAnnotation.backgroundColor);
  const [linkEditorState, setLinkEditorState] = React.useState({ title: "", url: "https://" });
  const [isButtonDisabled, setButtonDisabled] = React.useState(true);

  React.useEffect(() => {
    setBackgroundColor(currentAnnotation.backgroundColor);
  }, [currentAnnotation.backgroundColor]);

  const handleColorChange = (rgb) => {
    setBackgroundColor(adjoinRGB(rgb));
  };

  const handleLinkEditorStateChange = (val, n) => {
    setLinkEditorState((d) => ({
      ...d,
      [n]: val,
    }));
  };

  React.useEffect(() => {
    (document.getElementById("annotation-link-title") as HTMLInputElement) &&
    (document.getElementById("annotation-link-title") as HTMLInputElement).checkValidity() &&
    (document.getElementById("annotation-link-address") as HTMLInputElement) &&
    (document.getElementById("annotation-link-address") as HTMLInputElement).checkValidity()
      ? setButtonDisabled(false)
      : setButtonDisabled(true);
  }, [linkEditorState]);

  React.useEffect(() => {
    handleChange(backgroundColor, "backgroundColor");
  }, [backgroundColor]);

  // const [isLinkEditorOpen, setIsLinkEditorOpen] = React.useState(false);
  // const [linkAddress, setLinkAddress] = React.useState("");

  // const insertLink = () => {
  //   debugger
  //   const cursorPosition = quillRef.getSelection().index;

  //   quillRef.insertText(cursorPosition, linkAddress, 'user');
  //   quillRef.setSelection(cursorPosition, linkAddress.length);
  //   quillRef.theme.tooltip.edit('link', linkAddress);
  //   quillRef.theme.tooltip.save();
  // }

  /* let themeContext = React.useContext(ThemeContext); */

  return (
    <>
      <div id="toolbar" className="annotation-toolbar-wrapper">
        <div className="annotations-options-title">
          <p>Annotate</p>
        </div>
        <div className="annotations-options-wrapper">
          <span className="ql-formats">
            <select className="ql-font">
              <option value="arial">Arial</option>
              <option value="arial black">Arial Black</option>
              <option value="calibri">Calibri</option>
              <option value="cambria">Cambria</option>
              <option value="cambria math">Cambria Math</option>
              <option value="candara">Candara</option>
              <option value="comic sans ms">Comic Sans MS</option>
              <option value="consolas">Consolas</option>
              <option value="constantia">Constantia</option>
              <option value="corbel">Corbel</option>
              <option value="courier new">Courier New</option>
              <option value="georgia">Georgia</option>
              <option value="lucida sans">Lucida Sans</option>
              <option value="segoe ui" selected>
                Segoe UI
              </option>
              <option value="segoe ui light">Segoe UI Light</option>
              <option value="tahoma">Tahoma</option>
              <option value="times new roman">Times New Roman</option>
              <option value="trebuchet ms">Trebuchet MS</option>
              <option value="verdana">Verdana</option>
            </select>
            <select className="ql-size">
              <option value="8px">8</option>
              <option value="9px">9</option>
              <option value="10px">10</option>
              <option value="11px">11</option>
              <option value="12px" selected>
                12
              </option>
              <option value="14px">14</option>
              <option value="16px">16</option>
              <option value="18px">18</option>
              <option value="20px">20</option>
              <option value="22px">22</option>
              <option value="24px">24</option>
              <option value="26px">26</option>
              <option value="28px">28</option>
              <option value="36px">36</option>
              <option value="48px">48</option>
              <option value="72px">72</option>
            </select>
          </span>
          <span className="ql-formats">
            <select className="ql-color" />
            <select className="ql-background" />
            {/* <div className="annotation-window-background-color">
            <ColorPicker color={splitRGB(currentAnnotation.backgroundColor)} handleChange={({rgb}) => handleChange(adjoinRGB(rgb), "backgroundColor")} />
          </div> */}
          </span>
          <span className="ql-formats ql-text-formatting">
            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />
          </span>
          <span className="ql-formats list-formats">
            <button className="ql-list" value="bullet" />
            <button className="ql-list" value="ordered" />
          </span>

          <select className="ql-align" />
          {/* <span onClick={() => setIsLinkEditorOpen(true)}>Link</span> */}
          <div className="annotation-customlink-wrapper">
            <button className="ql-customlink" onClick={() => openLinkEditor()}>
              <svg viewBox="0 0 18 18">
                <line className="ql-stroke" x1="7" x2="11" y1="7" y2="11"></line>
                <path
                  className="ql-even ql-stroke"
                  d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"
                ></path>
                <path
                  className="ql-even ql-stroke"
                  d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"
                ></path>
              </svg>
            </button>
            <div className="annotation-link-editor-wrapper">
              <div
                className="annotation-link-editor-overlay cover"
                onClick={() =>
                  ((document.querySelector(".annotation-link-editor-wrapper") as HTMLElement).style.display = "none")
                }
              ></div>
              <div className="link-editor-container">
                <label htmlFor="annotation-link-title">
                  Title
                  <input
                    type="text"
                    id="annotation-link-title"
                    placeholder="Text to display"
                    value={linkEditorState.title}
                    required
                    onChange={(e) => handleLinkEditorStateChange(e.target.value, "title")}
                    autoComplete="off"
                  />
                </label>
                <label htmlFor="annotation-link-address">
                  URL
                  <input
                    type="url"
                    id="annotation-link-address"
                    placeholder="http://"
                    value={linkEditorState.url}
                    pattern="https?://.*"
                    required
                    onChange={(e) => handleLinkEditorStateChange(e.target.value, "url")}
                    autoComplete="off"
                  />
                </label>

                <div className="annotation-link-editor-buttons">
                  <button
                    id="annotation-link-cancel-btn"
                    onClick={() =>
                      ((document.querySelector(".annotation-link-editor-wrapper") as HTMLElement).style.display =
                        "none")
                    }
                  >
                    Cancel
                  </button>
                  <button id="annotation-link-ok-btn" className="ql-link" disabled={isButtonDisabled}>
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button className="ql-image" />
          <select className="ql-insertDataValues">
            <option disabled={true} selected={true} hidden={true} value="">
              &#931; Insert
            </option>
            {columns.map((value) => {
              return <option value={value.displayName}>{value.displayName}</option>;
            })}
          </select>
          <div className="annotation-window-background-color-wrapper">
            <div className="annotation-window-background-color">
              <img
                src={
                  /* themeContext["theme"] ? require("./assets/annotation-fill-color-dark.svg") : */ require("./assets/annotation-fill-color.svg")
                }
                alt=""
                width="19"
                height="16"
              />
              <ColorPicker color={splitRGB(backgroundColor)} handleChange={({ rgb }) => handleColorChange(rgb)} />
            </div>
          </div>

          {/* {isLinkEditorOpen && */}

          {/* } */}
        </div>
      </div>
    </>
  );
};

export default QuillToolbar;
