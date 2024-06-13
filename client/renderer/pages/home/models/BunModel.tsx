import react from "react";
import { motion } from "framer-motion";

const BunModel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <react.Fragment>
      {isOpen && (
        <motion.div
          exit={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50">
          <div className="bg-neutral-900/90 backdrop-blur-lg border-4 border-double border-red-600 p-4 rounded-3xl max-w-lg w-full shadow-[0_0_400px_rgba(255,0,0,0.5)] shadow-[#707070]">
            <h2 className="text-4xl text-red-600 font-black mb-4">
              Steps To Install Using <br></br>
              <span className="text-6xl block">bun</span>
            </h2>
            <ul className="font-semibold text-white list-disc flex flex-col items-start justify-start p-4">
              <li>open an empty project or old project</li>
              <li>open terminal inside the project</li>
              <li>type the following commads</li>
              <li>bun add yt-dlx</li>
            </ul>
            <button
              onClick={onClose}
              className="rounded-3xl border p-2 btn-wide hover:border-neutral-900 text-red-600 font-black border-red-600/50 bg-neutral-900 hover:bg-red-600 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600 disabled:pointer-events-none disabled:opacity-50">
              Close Model Box
            </button>
          </div>
        </motion.div>
      )}
    </react.Fragment>
  );
};

export default BunModel;
