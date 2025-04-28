import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';

const ChatMessage = ({ 
  id, 
  message, 
  isOwnMessage, 
  onReply 
}) => {
  const {
    content,
    sender,
    createdAt,
    attachments = [],
    replyTo,
    status = 'sent'
  } = message;
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      // Return time in 24-hour format (HH:MM)
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return '';
    }
  };
  
  // Render attachment based on file type
  const renderAttachment = (attachment) => {
    const { type, url, name } = attachment;
    
    if (type.startsWith('image/')) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
          <img 
            src={url} 
            alt={name} 
            className="object-contain max-h-48 w-auto"
            onClick={() => window.open(url, '_blank')}
          />
        </div>
      );
    } else if (type.startsWith('video/')) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
          <video 
            controls
            className="max-h-48 w-auto"
          >
            <source src={url} type={type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (type.startsWith('audio/')) {
      return (
        <div className="mt-2 w-full max-w-xs">
          <audio 
            controls
            className="w-full"
          >
            <source src={url} type={type} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    } else {
      // Generic file attachment
      return (
        <div className="mt-2 flex items-center bg-white dark:bg-gray-700 rounded-lg p-2 max-w-xs">
          <div className="text-gray-500 dark:text-gray-400 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="truncate flex-1">
            <div className="text-sm truncate">{name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {(attachment.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <a 
            href={url} 
            download={name}
            className="ml-2 text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      );
    }
  };
  
  // Render reply preview
  const renderReplyPreview = () => {
    if (!replyTo) return null;
    
    return (
      <div className="text-xs border-l-2 border-gray-300 dark:border-gray-600 pl-2 mb-1 max-w-xs truncate bg-white/20 dark:bg-black/20 py-1 rounded">
        <span className="font-medium">
          {replyTo.sender._id === sender._id ? 'You' : replyTo.sender.username || 'User'}:
        </span> {replyTo.content || <i>Attachment</i>}
      </div>
    );
  };
  
  // Render status indicator
  const renderStatusIndicator = () => {
    if (!isOwnMessage) return null;
    
    switch (status) {
      case 'sending':
        return (
          <span className="text-gray-400 text-xs ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        );
      case 'sent':
        return (
          <span className="text-gray-400 text-xs ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'delivered':
        return (
          <span className="text-gray-400 text-xs ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l7.293-7.293a1 1 0 111.414 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L4 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'read':
        return (
          <span className="text-blue-500 text-xs ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l7.293-7.293a1 1 0 111.414 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L4 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'failed':
        return (
          <span className="text-red-500 text-xs ml-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Failed
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div 
      id={id}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} relative z-10`}
    >
      <div 
        className={`
          max-w-[75%] flex flex-col
          ${isOwnMessage ? 'items-end' : 'items-start'}
        `}
      >
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">
            {sender.username || 'User'}
          </div>
        )}
        
        <div 
          className={`
            ${isOwnMessage 
              ? 'bg-[#dcf8c6] dark:bg-[#025c4c] text-black dark:text-white rounded-tl-lg rounded-tr-sm rounded-bl-lg rounded-br-lg' 
              : 'bg-white dark:bg-[#202c33] text-black dark:text-white rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg'
            }
            px-3 py-2 shadow-sm relative
          `}
        >
          {renderReplyPreview()}
          
          {content && <div className="whitespace-pre-wrap break-words">{content}</div>}
          
          {attachments.map((attachment, index) => (
            <div key={index}>
              {renderAttachment(attachment)}
            </div>
          ))}
          
          <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} text-xs mt-1`}>
            <span className={`
              ${isOwnMessage ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}
            `}>
              {formatTimestamp(createdAt)}
            </span>
            {renderStatusIndicator()}
          </div>

          {/* Message tail for WhatsApp-like appearance */}
          <div 
            className={`absolute ${isOwnMessage ? 'right-[-8px]' : 'left-[-8px]'} top-0 w-2 overflow-hidden inline-block`}
          >
            <div 
              className={`
                h-4 w-4 transform ${isOwnMessage ? 'rotate-45 bg-[#dcf8c6] dark:bg-[#025c4c]' : 'rotate-45 bg-white dark:bg-[#202c33]'}
                ${isOwnMessage ? 'origin-bottom-left' : 'origin-bottom-right'}
              `}
            ></div>
          </div>
        </div>
        
        <div 
          className={`
            opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity
            flex items-center mt-1 space-x-1
          `}
        >
          <button 
            onClick={onReply}
            className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 p-1"
            aria-label="Reply"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  id: PropTypes.string,
  message: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string,
    sender: PropTypes.object.isRequired,
    createdAt: PropTypes.string.isRequired,
    attachments: PropTypes.array,
    replyTo: PropTypes.object,
    status: PropTypes.oneOf(['sending', 'sent', 'delivered', 'read', 'failed'])
  }).isRequired,
  isOwnMessage: PropTypes.bool.isRequired,
  onReply: PropTypes.func.isRequired
};

export default ChatMessage; 