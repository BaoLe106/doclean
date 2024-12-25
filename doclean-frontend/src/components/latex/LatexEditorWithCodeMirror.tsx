import React, { useEffect, useState, useRef, useCallback } from "react";
// import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";

//CodeMirror
import { basicSetup } from "codemirror";
import { ChangeSet, EditorState, Text } from "@codemirror/state";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import {
  Update,
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
} from "@codemirror/collab";

const LatexEditorWithCodeMirror: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
  const [codemirrorView, setCodemirrorView] = useState<EditorView | undefined>(
    undefined
  );
  const [quill, setQuill] = useState<Quill>();
  const [quillContent, setQuillContent] = useState<string>("");
  const { sessionId } = useParams<{ sessionId: string }>();

  // SET WEBSOCKET CONNECTION
  // useEffect(() => {
  //   // Create WebSocket connection to the backend

  // }, []);

  // LOAD DOCUMENT DATA
  // useEffect(() => {
  //   if (!socket || !quill) return;
  //   socket.onopen = () => quill.enable();

  //   socket.onmessage = (event) => {
  //     // if (isBackendUpdate.current) return;
  //     const msg = JSON.parse(event.data);
  //     if (!msg.content) return;
  //     // quill.setContents(msg.content);
  //   };

  //   return () => {
  //     socket.close();
  //   };
  // }, [socket, quill, sessionId]);

  // RECEIVE ONCHANGE DATA FROM BACKEND
  useEffect(() => {
    if (!socket || !quill) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.content) return;

      // handleRemoteChanges(data);

      // if (data.content.messages) {
      //   const messages = data.content.messages;
      //   messages.forEach((msg: any) => {
      //     quill.updateContents(msg);
      //   });
      // } else {
      //   const message = data.content;
      //   quill.updateContents(message);
      // }
    };

    return () => {
      socket.close();
    };
  }, [socket, quill]);

  // SEND ONCHANGE DATA TO BACKEND
  // useEffect(() => {
  //   if (!socket || !quill) return;
  //   const handler = (
  //     delta: {
  //       insert?: string | Record<string, unknown>;
  //       delete?: number;
  //       retain?: number | Record<string, unknown>;
  //       attributes?: {
  //         [key: string]: unknown;
  //       };
  //     },
  //     oldDelta: any,
  //     source: string
  //   ) => {
  //     setQuillContent(quill.getText());
  //     if (source !== "user") return;
  //     socket.send(JSON.stringify({ content: delta }));
  //   };
  //   quill.on("text-change", handler);

  //   return () => {
  //     quill.off("text-change", handler);
  //   };
  // }, [socket, quill]);

  // useEffect(() => {
  //   if (iframeRef.current) {
  //     iframeRef.current?.contentWindow?.postMessage(
  //       { type: "latex", quillContent },
  //       "*"
  //     );
  //   }
  // }, [quillContent]);

  useEffect(() => {
    codemirrorView?.updateListener.of((update: any) => {
      console.log("debug update listener", update.docChanged);
      if (update.docChanged) {
        handleLocalChanges(update);
      }
    });
  }, [codemirrorView.updateListener]);

  const handleLocalChanges = (update: { state: EditorState }) => {
    console.log("debug handle local changes", update);

    console.log("debug view and socket", codemirrorView, socket);
    if (!codemirrorView || !socket) return;

    const updates = sendableUpdates(update.state);
    updates.forEach((u) => {
      const payload = {
        version: getSyncedVersion(update.state),
        changes: u.changes.toJSON(),
        effects: u.effects || [],
      };
      socket.send(JSON.stringify(payload));
    });
  };

  const handleRemoteChanges = (event: MessageEvent) => {
    if (!codemirrorView) return;

    const { updates } = JSON.parse(event.data);
    const updateObjects = updates.map((u: any) => ({
      changes: ChangeSet.fromJSON(u.changes),
      effects: u.effects || [],
      clientID: u.clientID,
    }));

    const transaction = receiveUpdates(codemirrorView.state, updateObjects);
    codemirrorView.dispatch(transaction);
  };

  useEffect(() => {
    // let editor = document.getElementById("editor");
    // console.log("debug editors", editor)

    // let view = new EditorView({
    //   extensions: [basicSetup],
    //   parent: editor
    // })
    // setCodemirrorView(view);

    if (!editorRef.current) return;

    const socketConnection = new WebSocket(
      `ws://localhost:8080/api/v1/latex/${sessionId}`
    );

    // Set the WebSocket connection to state
    setSocket(socketConnection);

    // Initialize the editor
    const state = EditorState.create({
      // doc: "Start collaborating...",
      extensions: [
        basicSetup,
        collab({ startVersion: 0 }),
        // EditorView.
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    setCodemirrorView(view);
    return () => {
      view.destroy();
      socketConnection.close();
    };
  }, []);

  const wrapperRef = useCallback((wrapper: any) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: false,
      },
      // { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    // q.setText("Loading...");
    setQuill(q);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* <div className="container" style={{ width: "40%", height: "83vh" }} ref={wrapperRef}></div> */}
      <div
        ref={editorRef}
        id="editor"
        style={{ width: "40%", height: "83vh" }}
      ></div>
      <iframe
        style={{ width: "60%", height: "83vh" }}
        ref={iframeRef}
        src="/latex.html"
      ></iframe>
    </div>
  );
};

export default LatexEditorWithCodeMirror;