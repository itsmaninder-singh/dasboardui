import React from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "../components/common/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
        <Compass className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
        HTTP 404 // ROUTE OUT OF BOUNDS
      </span>

      <h1 className="text-3xl font-heading font-bold text-slate-100 mb-2">
        Unknown Coordinate
      </h1>

      <p className="text-sm text-slate-400 max-w-md mb-6 font-sans">
        The requested system endpoint does not correspond to any registered view inside the PM dashboard perimeter.
      </p>

      <Link to="/">
        <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Mission Command
        </Button>
      </Link>
    </div>
  );
};
