import React from "react";
import Grid from '@mui/material/Grid';
import { Stack } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { Box, CircularProgress } from '@mui/material';

export const LayoutLoader = () => {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};

export const ButtonLoader = () => {
  return <CircularProgress size={24} color="inherit" />;
};

export default LayoutLoader;
