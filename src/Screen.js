import React, {useCallback, useEffect, useState, useRef} from 'react';
import './Screen.scss';
import Dropdown from 'react-bootstrap/Dropdown';

function Screen() {
    const [text, setText] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);
    const inputRef = useRef(null);
    const terminalRef = useRef(null);
    const [terminalHistory, setTerminalHistory] = useState(["test"]);
 
    useEffect(() => {
        const handleFocus = () => {
            inputRef.current?.focus();
        };

        handleFocus();

        document.addEventListener('click', handleFocus);

        const interval = setInterval(() => {
            setCursorVisible(prev => !prev);
        }, 500);


        const preventBlur = (e) => {
            e.preventDefault();
            inputRef.current?.focus();
        };

        document.addEventListener('blur', preventBlur, true);

        return () => {
            clearInterval(interval);
            document.removeEventListener('click', handleFocus);
            document.removeEventListener('blur', preventBlur, true);
        }
    }, []);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalHistory, text]);

   function handleCommand(text){
        if(!text.trim()){
            setTerminalHistory(prev => [...prev, ""]);
            return;
        }
        if(text === "clear"){
            setTerminalHistory([]);
        }
        else if(text.startsWith("echo ")){
            setTerminalHistory(prev => [...prev, text.substring(4)]);
        }
        else{
            setTerminalHistory(prev => [...prev, "Unrecognized command " + text])
        }
        setTimeout(() => {
            if (terminalRef.current) {
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
        }, 0);
   }

    const handleKeyDown = (e) => {
        e.preventDefault();
        if (e.key === "Backspace") {
            setText(prev => prev.slice(0,-1));
        } 
        else if(e.key === "Enter"){
            handleCommand(text);
            setText('');
        }
        else if(e.key.length === 1) {
            setText(prev => prev + e.key);
        }
    };

   

    const label = "$>"
    return(
        <div>
        <div className='screen'>
            <div className='terminal-container' ref={terminalRef}>
            <div className='terminal-text'>
                <h3>webpack compiled successfully</h3>
                <div className='terminal-history'>
                    {terminalHistory.map((line) => <p>{line}</p>)}
                </div>
                <div className='terminal-prompt'>
                    <div 
                        ref={inputRef}
                        tabIndex={0}
                        onFocus={() => {}}
                        onKeyDown={handleKeyDown}
                        className='terminal-input-container'
                    >
                        <span>{label} {text}</span>
                        <span 
                            className={`terminal-cursor ${cursorVisible ? 'visible' : ''}`}
                            
                        ></span>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    );
}

export default Screen;