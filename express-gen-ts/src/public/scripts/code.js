const codeTextArea = document.getElementById('source');
const code = new CodeMirror.fromTextArea(codeTextArea, {
    lineNumbers: true,
    mode: "text/x-c++src",
    theme: "darcula",
    matchBrackets: true,
    autoCloseBrackets: true,
    indentUnit: 4,
    placeholder: 'Your code goes here...'
});
const inputTextArea = document.getElementById('code-input');
const input = CodeMirror.fromTextArea(inputTextArea, {
    lineNumbers: true,
    theme: "darcula",
    placeholder: "Your input goes here...",
    mode: "text/plain"
});

const stdout = CodeMirror(document.getElementById('stdout-window'), {
    readOnly: true,
    theme: "material",
    placeholder: "Your output shows here...",
    lineNumbers: true,
    mode: "text/plain"
});
let building = false;

/**
 * Start everything from here
 */
(function() {
    // Setup socket-io main connection
    console.log('Connecting to socket-io');
    const socket = io('/');
    socket.on('connect', () => {
        socketIo = socket;
        console.log('Socket-io connected');
        // Connect to the room
        setupSendFileListener(socket.id)
        receiveStdout(socket);
    });
})();


/**
 * Send a message.
 *
 * @param {*} socketId
 */
function setupSendFileListener(socketId) {
    document.getElementById('run-c-code-btn').addEventListener('click', function (event) {
        event.preventDefault();
        const _code = code.getValue();
        code.setOption("mode", "text/x-c++src");
        console.log(_code);
        const _input = input.getValue();
        stdout.setValue('');
        Http.Post('/api/cmd/run-c', {
            socketId: socketId,
            code: _code,
            input: _input
        }).then();
    });
    document.getElementById('run-py3-code-btn').addEventListener('click', function (event) {
        event.preventDefault();
        const _code = code.getValue();
        code.setOption("mode", "text/x-python");
        console.log(_code);
        const _input = input.getValue();
        stdout.setValue('');
        Http.Post('/api/cmd/run-py3', {
            socketId: socketId,
            code: _code,
            input: _input
        }).then();
    });
    document.getElementById('run-java-code-btn').addEventListener('click', function (event) {
        event.preventDefault();
        const _code = code.getValue();
        code.setOption("mode", "text/x-java");
        console.log(_code);
        const _input = input.getValue();
        stdout.setValue('');
        Http.Post('/api/cmd/run-java', {
            socketId: socketId,
            code: _code,
            input: _input
        }).then();
    });
}


/**
 * Receive a socket message.
 *
 * @param {*} socket
 */
function receiveStdout(socket) {
    socket.on('status', (msg) => {
        stdout.setOption("lineWrapping", true);
        replaceMessage(msg);
        building = true;
    });
    // socket.on('run', (msg) => {
    //     stdout.setOption("lineWrapping", false);
    //     inputMessage(msg);
    // });
    // socket.on('now_running', (msg) => {
    //     stdout.setOption("lineWrapping", false);
    //     inputMessage(msg);
    // });
    socket.on('stdout', (msg) => {
        stdout.setOption("lineWrapping", false);
        if (building) return replaceMessage(msg);
        addMessage(msg);
        building = false;
    });
    socket.on('stderr', (msg) => {
        stdout.setOption("lineWrapping", true);
        if (building) return replaceMessage(msg);
        addMessage(msg);
        building = false;
    });
}


/**
 * Get the html content for a single chat message
 *
 * @param {*} msg
 * @returns
 */
function addMessage(msg) {
    stdout.setValue(stdout.getValue() + msg);
}

/**
 * Get the html content for a single chat message
 *
 * @param {*} msg
 * @returns
 */
function replaceMessage(msg) {
    stdout.setValue(msg);
}

/**
 * Get the html content for a single chat message
 *
 * @param {*} msg
 * @returns
 */
function inputMessage(msg) {
    input.setValue(msg);
}

