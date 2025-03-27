import React, {useCallback, useEffect, useState, useRef} from 'react';
import './Screen.scss';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';

function Screen() {
    const [text, setText] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);
    const inputRef = useRef(null);
    const terminalRef = useRef(null);
    const [terminalHistory, setTerminalHistory] = useState([""]);
    const [fileOptions, setFileOptions] = useState(["factorial", "bubble-sort", "quick-sort", "more-than-4", "binary-tree", "tree-visitor"]);
    const [currentFile, setCurrentFile] = useState("");
    const [currentASM, setCurrentASM] = useState("");
    const artAddedRef = useRef(false);
    const instructionsAddedRef = useRef(false);


    const art = ([
        "           _       _     _                   ____ ",
        " _ __ ___ (_)_ __ (_)   | | __ ___   ____ _ / ___|",
        "| '_ ` _ \\| | '_ \\| |_  | |/ _` \\ \\ / / _` | |    ",
        "| | | | | | | | | | | |_| | (_| |\\ V / (_| | |___ ",
        "|_| |_| |_|_|_| |_|_|\\___/ \\__,_| \\_/ \\__,_|\\____|"
    ])

    const instructions = ([
        "|------------------------------------------------------|",
        "Welcome to my miniJava to MIPS compiler demo.",
        "Commands:",
        "ls: see available files",
        "read <filename>: to display contents of a file(java or mips).",
        "compile <java-filename> specify a java file to be compiled. Resulting assembly will be stored in <filename>.s",
        "run: runs the currently compiled java program.",
        "download <filename>: downloads specified file to your machine.",
        "clear: clears the terminal interface.",
        "info: shows this info.",
        "Available demo files:"

    ])

    const downloadTextFile = (content, filename) => {
        
        const blob = new Blob([content], { type: 'text/plain' });
        
       
        const url = URL.createObjectURL(blob);
        
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

    function download(filename){
        if(fileOptions.includes(filename)){
            let content = get_java(filename);
            downloadTextFile(content, filename+".java")
            setTerminalHistory(prev => [...prev, "Downloading file => " + filename + ".java"])
        }
        else if(filename === currentFile+".s"){
            setTerminalHistory(prev => [...prev, "Downloading file => " + filename + ".s"])
            downloadTextFile(currentASM, currentFile+".s");
        }
        else{
            setTerminalHistory(prev => [...prev, "Unable to open file: " + filename])
        }
        
    }
    
 
    useEffect(() => {
        const handleFocus = () => {
            inputRef.current?.focus();
        };

        handleFocus();
        
        if (!artAddedRef.current) {
            art.forEach((line) => setTerminalHistory(prev => [...prev, line]));
            artAddedRef.current = true;
        }

        if (!instructionsAddedRef.current) {
            instructions.forEach((line) => setTerminalHistory(prev => [...prev, line]));
            instructionsAddedRef.current = true;
            let fileSting = "| ";
            fileOptions.forEach((file) => {
                fileSting += file + " | ";
            });
            setTerminalHistory(prev => [...prev, fileSting]);
        }
        

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

    function compile(name){
        axios.get('http://127.0.0.1:5000/api/compile/' + name)
        .then(response => {
            if (response.data && response.data.typecheck !== undefined && response.data.asm !== undefined) {
                setTerminalHistory(prev => [...prev, response.data.typecheck]);
                setCurrentASM(response.data.asm);
            } else {
                setTerminalHistory(prev => [...prev, "Error: Unexpected response format"]);
                console.error("Unexpected response format:", response.data);
            }
        })
        .catch(error => {
            console.error("Compilation error:", error);
            setTerminalHistory(prev => [...prev, `Error: ${error.message}`]);
        });
    }

    function get_java(name){
        axios.get('http://127.0.0.1:5000/api/java/' + name)
        .then(response => {
            if (response.data && response.data.java !== undefined) {
                console.log(response.data.java);
                return response.data.java;

                
            } else {
                setTerminalHistory(prev => [...prev, "Error: Unexpected response format"]);
                console.error("Unexpected response format:", response.data);
            }
        })
        .catch(error => {
            console.error("Compilation error:", error);
            setTerminalHistory(prev => [...prev, `Error: ${error.message}`]);
        });
    }

    function read_java(name){

        axios.get('http://127.0.0.1:5000/api/java/' + name)
        .then(response => {
            if (response.data && response.data.java !== undefined) {
                console.log(response.data.java);
                const lines = response.data.java.split('\n');

                lines.forEach((line, index) => {
                    setTerminalHistory(prev => [...prev, line]);
                });

                
            } else {
                setTerminalHistory(prev => [...prev, "Error: Unexpected response format"]);
                console.error("Unexpected response format:", response.data);
            }
        })
        .catch(error => {
            console.error("Compilation error:", error);
            setTerminalHistory(prev => [...prev, `Error: ${error.message}`]);
        });

    }

    function read_asm(){
        axios.get('http://127.0.0.1:5000/api/assembly')
        .then(response => {
            if (response.data && response.data.asm !== undefined) {
                const lines = response.data.asm.split('\n');

                lines.forEach((line, index) => {
                    setTerminalHistory(prev => [...prev, line]);
                });

                
            } else {
                setTerminalHistory(prev => [...prev, "Error: Unexpected response format"]);
                console.error("Unexpected response format:", response.data);
            }
        })
        .catch(error => {
            console.error("Compilation error:", error);
            setTerminalHistory(prev => [...prev, `Error: ${error.message}`]);
        });
    }

    function run(){
        axios.get('http://127.0.0.1:5000/api/run/'+currentFile)
        .then(response => {
            if (response.data && response.data.out !== undefined) {
                const lines = response.data.out.split('\n');

                lines.forEach((line, index) => {
                    setTerminalHistory(prev => [...prev, line]);
                });

                
            } else {
                setTerminalHistory(prev => [...prev, "Error: Unexpected response format"]);
                console.error("Unexpected response format:", response.data);
            }
        })
        .catch(error => {
            console.error("Compilation error:", error);
            setTerminalHistory(prev => [...prev, `Error: ${error.message}`]);
        });
    }

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
        else if(text.startsWith("compile ")){
            if(fileOptions.includes(text.substring(8))){
                compile(text.substring(8));
                setCurrentFile(text.substring(8));
            }
            else{
                setTerminalHistory(prev => [...prev, "Unable to open file: '" + text.substring(8) + "'"]);
            }
            
        }
        else if(text == "run"){
            run();
        }
        else if(text.startsWith("read ")){
            if(text.substring(5) === "mips" || text.substring(5) === currentFile+".s"){
                setTerminalHistory(prev => [...prev, currentASM]);
            }
            else if (fileOptions.includes(text.substring(5))){
                read_java(text.substring(5));
            }
            else{
                setTerminalHistory(prev => [...prev, "Unable to open file: '" + text.substring(5) + "'"]);
            }
            
        }
        else if(text === "info"){
            art.forEach((line) => setTerminalHistory(prev => [...prev, line]));
            instructions.forEach((line) => setTerminalHistory(prev => [...prev, line]));
            let fileSting = "| ";
            fileOptions.forEach((file) => {
                fileSting += file + " | ";
            });
            setTerminalHistory(prev => [...prev, fileSting]);
        }
        else if(text.startsWith("download ")){
            download(text.substring(9));
        }
        else if(text === "ls"){
            let fileSting = "| ";
            fileOptions.forEach((file) => {
                fileSting += file + " | ";
            });
            if(currentFile.length > 0){
                fileSting += currentFile + ".s |";
            }
            
            setTerminalHistory(prev => [...prev, fileSting]);
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
            setTerminalHistory(prev => [...prev, "$> " + text])
            setText('');
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
        <div className="chassis">

        <div class="power-button"></div>
        <div class="led"></div>
        <div class="vents">
            <div class="vent"></div>
            <div class="vent"></div>
            <div class="vent"></div>
            <div class="vent"></div>
            <div class="vent"></div>
        </div>
        <div class="screw screw-1"></div>
        <div class="screw screw-2"></div>
        <div class="screw screw-3"></div>
        <div class="screw screw-4"></div>

        <div className='screen'>
            <div className='terminal-container' ref={terminalRef}>
            <div className='terminal-text'>

                
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
    </div>
    );
}

export default Screen;