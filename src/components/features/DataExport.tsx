import React from 'react';
import { motion } from 'framer-motion';
import { Download, Database, FileText, Share2 } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Button } from '../ui/Button';

interface DataExportProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataExport: React.FC<DataExportProps> = ({ isOpen, onClose }) => {
  const theme = useThemeClasses();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`${theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          border rounded-3xl shadow-2xl p-6 w-full max-w-md`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Database className={`w-6 h-6 text-indigo-500`} />
            <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Data Export</h2>
          </div>
          <p className={`${theme.textSecondary} text-sm`}>
            Export your habit data and backup your progress
          </p>
        </div>

        {/* Export Options */}
        <div className="space-y-3 mb-6">
          <div className={`${theme.isDark ? 'bg-gray-700/50 hover:bg-gray-700/70' : 'bg-gray-50 hover:bg-gray-100'} 
            transition-colors rounded-xl p-4 cursor-pointer border border-transparent hover:border-indigo-300`}>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              <div>
                <div className={`font-medium ${theme.textPrimary} text-sm`}>Export as CSV</div>
                <div className={`text-xs ${theme.textSecondary}`}>Download spreadsheet-friendly format</div>
              </div>
            </div>
          </div>

          <div className={`${theme.isDark ? 'bg-gray-700/50 hover:bg-gray-700/70' : 'bg-gray-50 hover:bg-gray-100'} 
            transition-colors rounded-xl p-4 cursor-pointer border border-transparent hover:border-indigo-300`}>
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-indigo-500" />
              <div>
                <div className={`font-medium ${theme.textPrimary} text-sm`}>Export as JSON</div>
                <div className={`text-xs ${theme.textSecondary}`}>Raw data for developers</div>
              </div>
            </div>
          </div>

          <div className={`${theme.isDark ? 'bg-gray-700/50 hover:bg-gray-700/70' : 'bg-gray-50 hover:bg-gray-100'} 
            transition-colors rounded-xl p-4 cursor-pointer border border-transparent hover:border-indigo-300`}>
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-indigo-500" />
              <div>
                <div className={`font-medium ${theme.textPrimary} text-sm`}>Share Progress</div>
                <div className={`text-xs ${theme.textSecondary}`}>Generate shareable progress report</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className={`${theme.isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'} rounded-xl p-4 mb-6`}>
          <h3 className={`font-semibold ${theme.textPrimary} mb-2 text-sm`}>Planned Features:</h3>
          <ul className={`text-xs ${theme.textSecondary} space-y-1`}>
            <li>• Automated backups to cloud</li>
            <li>• Import from other apps</li>
            <li>• PDF progress reports</li>
            <li>• Data visualization exports</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button onClick={onClose} variant="primary" className="w-full">
            Coming Soon
          </Button>
          <div className="text-center">
            <span className={`text-xs ${theme.textSecondary}`}>
              📊 Feature Rating: 2/5 - Important for data portability and peace of mind
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};