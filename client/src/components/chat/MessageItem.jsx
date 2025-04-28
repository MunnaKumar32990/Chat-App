import React from 'react';
import { format } from 'date-fns';
import { 
  InsertDriveFile as FileIcon,
  Image as ImageIcon, 
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const MessageItem = ({ message, isOwn, showAvatar, onDelete }) => {
  const { content, createdAt, sender, isFileMessage, fileUrl, fileType, fileName } = message;

  const renderFileContent = () => {
    if (!isFileMessage) return null;

    const isImage = fileType?.startsWith('image/');
    const isPdf = fileType === 'application/pdf';
    const isDoc = fileType === 'application/msword' || 
                  fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="relative">
            <img 
              src={`http://localhost:5002${fileUrl}`} 
              alt={fileName || "Image"} 
              className="rounded max-w-full max-h-[200px] mb-2"
            />
          </div>
        ) : (
          <div className="flex items-center p-2 bg-white bg-opacity-10 rounded">
            {isPdf ? <PdfIcon /> : isDoc ? <DocIcon /> : <FileIcon />}
            <span className="ml-2 truncate max-w-[200px]">{fileName}</span>
            <a 
              href={`http://localhost:5002${fileUrl}`}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto"
            >
              <DownloadIcon fontSize="small" />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 mr-2 overflow-hidden">
          {sender.avatar ? (
            <img src={sender.avatar} alt={sender.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white">
              {sender.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      <div 
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwn 
            ? 'bg-indigo-600 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        {!isOwn && showAvatar && (
          <div className="text-xs font-medium mb-1">
            {sender.username}
          </div>
        )}
        
        {content && <div className="break-words">{content}</div>}
        
        {isFileMessage && renderFileContent()}
        
        <div className={`text-xs mt-1 text-right ${
          isOwn ? 'text-indigo-200' : 'text-gray-500'
        }`}>
          {createdAt && format(new Date(createdAt), 'HH:mm')}
        </div>
      </div>
      
      {isOwn && (
        <div className="ml-2">
          <button 
            onClick={onDelete}
            className="text-gray-500 hover:text-red-500 text-xs"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageItem; 