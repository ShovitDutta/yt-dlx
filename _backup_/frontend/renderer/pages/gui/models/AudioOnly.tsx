// ============================================================================/ with-websocket /============================================================================
//
import React from "react";
import { motion } from "framer-motion";

interface Input {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AudioOnly: React.FunctionComponent<Input> = ({ isOpen, onClose, videoId }) => {
  const [_outputFolder, outputFolder_] = React.useState<string | null>(null);
  const [_quality, quality_] = React.useState<string | null>(null);
  const [_filename, filename_] = React.useState<any>(null);
  const [_progress, progress_] = React.useState<any>(null);
  const _modelref = React.useRef<HTMLDivElement>(null);
  const [error, _error] = React.useState<any>(null);
  const [formData, _formData] = React.useState({
    metadata: false,
    verbose: true,
    useTor: true,
    stream: true,
  });

  React.useEffect(() => {
    const ClickOutside = (event: MouseEvent) => {
      if (_modelref.current && !_modelref.current.contains(event.target as Node)) {
        onClose();
        quality_(null);
        progress_(null);
        filename_(null);
        outputFolder_(null);
      }
    };
    if (isOpen) document.addEventListener("mousedown", ClickOutside);
    else document.removeEventListener("mousedown", ClickOutside);
    return () => {
      document.removeEventListener("mousedown", ClickOutside);
    };
  }, [isOpen, onClose]);

  const socket = React.useRef<WebSocket | null>(null);
  React.useEffect(() => {
    socket.current = new WebSocket("ws://localhost:8642");
    socket.current.onopen = () => console.log("WebSocket connected");
    socket.current.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.event === "progress") {
        progress_(null);
        progress_((prev: any) => ({ ...prev, ...message.data }));
      }
      if (message.event === "end") filename_(message.data);
      if (message.event === "error") _error(message.data);
    };
    socket.current.onerror = () => _error("WebSocket error occurred");
    return () => {
      if (socket.current) socket.current.close();
    };
  }, []);

  return (
    <React.Fragment>
      {isOpen && (
        <motion.div
          exit={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center h-full w-full backdrop-blur-lg bg-neutral-900/60">
          <div
            ref={_modelref}
            className="bg-neutral-900 rounded-3xl p-8 backdrop-blur-lg border-4 border-double border-red-700 shadow-red-700 shadow-[0_0_800px_rgba(255,0,0,0.5)] w-auto max-w-[90vw] max-h-[90vh] overflow-y-auto flex flex-col items-center justify-start text-center">
            <h2 className="text-7xl text-red-700 font-black mb-10">
              Choose Your Poison For <br />
              <span className="text-9xl block italic">Audio</span>
            </h2>
            <ul className="font-semibold list-disc mb-10 text-white text-xl">
              <li
                onClick={() => {
                  quality_(null);
                  progress_(null);
                  filename_(null);
                  quality_("AudioHighest");
                }}
                className={`hover:text-red-700 text-2xl cursor-pointer italic font-bold ${_quality === "AudioHighest" ? "text-red-700" : "text-white/40"}`}>
                Highest Possible Download
              </li>
              <li
                onClick={() => {
                  quality_(null);
                  progress_(null);
                  filename_(null);
                  quality_("AudioLowest");
                }}
                className={`hover:text-red-700 text-2xl cursor-pointer italic font-bold ${_quality === "AudioLowest" ? "text-red-700" : "text-white/40"}`}>
                Lowest Possible Download
              </li>
            </ul>
            {_quality && (
              <React.Fragment>
                <form
                  onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                      const payLoad = {
                        event: _quality,
                        payload: {
                          metadata: formData.metadata,
                          verbose: formData.verbose,
                          stream: formData.stream,
                          useTor: formData.useTor,
                          output: _outputFolder,
                          query: videoId,
                        },
                      };
                      socket.current.send(JSON.stringify(payLoad));
                    } else _error("WebSocket connection not established!");
                  }}
                  className="flex flex-col items-center">
                  <div className="flex flex-col items-center">
                    {_outputFolder ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const folder = await window.ipc.invoke("select-output-folder");
                          if (folder) outputFolder_(folder);
                        }}
                        className="rounded-3xl border p-2 btn-wide italic text-neutral-900 font-black border-neutral-900 bg-red-700 px-8 text-sm scale-110 mb-4">
                        Location: {_outputFolder}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          const folder = await window.ipc.invoke("select-output-folder");
                          if (folder) outputFolder_(folder);
                        }}
                        className="rounded-3xl border p-2 btn-wide hover:border-neutral-900 text-red-700 font-black border-red-700/50 bg-neutral-900 hover:bg-red-700 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-110 mb-4">
                        Browse Output Location
                      </button>
                    )}
                    {_outputFolder && !_filename && (
                      <React.Fragment>
                        <button
                          type="submit"
                          className="rounded-3xl border p-2 btn-wide hover:border-neutral-900 text-red-700 font-black border-red-700/50 bg-neutral-900 hover:bg-red-700 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-110">
                          Connect and Download
                        </button>
                      </React.Fragment>
                    )}
                  </div>
                </form>
              </React.Fragment>
            )}
            {_filename && (
              <ul className="text-white/60 items-start justify-start flex flex-col list-disc mt-6">
                <li>
                  <span className="text-red-700 font-black mr-2">Location:</span>
                  {_outputFolder || "-"}
                </li>
                <li>
                  <span className="text-red-700 font-black mr-2">Filename:</span>
                  {_filename || "-"}
                </li>
                <li>
                  <span className="text-red-700 font-black mr-2">frames:</span>
                  {_progress?.frames || "-"}
                </li>
                <li>
                  <span className="text-red-700 font-black mr-2">currentFps:</span>
                  {_progress?.currentFps || "-"}
                </li>
                <li>
                  <span className="text-red-700 font-black mr-2">targetSize:</span>
                  {_progress?.targetSize || "-"}
                </li>
                <li>
                  <span className="text-red-700 font-black mr-2">timemark:</span>
                  {_progress?.timemark || "-"}
                </li>
                <li>
                  <span className="text-red-700 font-black mr-2">progress:</span>
                  {_progress?.progress || "-"}
                </li>
                <li>
                  <span className="text-red-700 font-black mr-2">Error:</span>
                  {error || "-"}
                </li>
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </React.Fragment>
  );
};

export default AudioOnly;

//
// ============================================================================/ with-websocket /============================================================================
