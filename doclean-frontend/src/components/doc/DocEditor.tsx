import React, { useEffect, useState, useCallback, useRef } from "react";
import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";

import "./styles.css";
import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
} from "@syncfusion/ej2-react-documenteditor";

import { registerLicense } from "@syncfusion/ej2-base";
registerLicense(import.meta.env.VITE_SYNCFUSION_KEY);
let PAGE_HEIGHT: number = 862;

const DocEditor: React.FC = () => {
  const documentEditorRef = useRef<DocumentEditorContainerComponent>(null);
  const [previousContent, setPreviousContent] = useState<string>('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // const [quill, setQuill] = useState<Quill>();
  const { sessionId } = useParams<{ sessionId: string }>();

  // SET WEBSOCKET CONNECTION
  useEffect(() => {
    if (documentEditorRef.current) {
      documentEditorRef.current.documentEditor.showRevisions = false;
    }
    // Create WebSocket connection to the backend
    // const socketConnection = new WebSocket(
    //   `ws://localhost:8080/api/v1/doc/${sessionId}`
    // );

    // // Set the WebSocket connection to state
    // setSocket(socketConnection);

    // return () => {
    //   socketConnection.close();
    // };
  }, []);

  useEffect(() => {
    if (documentEditorRef.current) {
      const editorInstance = documentEditorRef.current.documentEditor;

      // Handle content changes
      editorInstance.contentChange = (e: any) => {
        console.log('debug e', e)
        // let revisions = editorInstance.revisions;
        // console.log("debug revisions", revisions)
        // revisions.get(0).accept();
        // revisions.get(revisions.length - 1).accept()
        // const currentContent = editorInstance.serialize();

        // console.log("debug prev, curr", previousContent, currentContent);
        
        // const diffs = dmp.diff_main(previousContent, currentContent);
        // dmp.diff_cleanupSemantic(diffs); // Optional: Clean up diffs for better readability
        // console.log("debug Diffs:", diffs);

        // // Send diffs to the server
        // // sendDiffsToServer(diffs);

        // // Update the previous content
        setPreviousContent('a');
      };
    }
  }, [previousContent]);
  
  const beforeAcceptRejectChanges = (args: any) => {
    // Check the author of the revision
    console.log("debug args", args)
    args.cancel = false;
  };

  // const handleContentChange = (e: any) => {
  // };

  return (
    <div>
      <DocumentEditorContainerComponent
        ref={documentEditorRef}
        height="590"
        enableToolbar={true}
        enableTrackChanges={true}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        // beforeAcceptRejectChanges={beforeAcceptRejectChanges}
        // contentChange={handleContentChange}
      >
        <Inject services={[Toolbar]}></Inject>
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default DocEditor;
