const peer = new Peer();

peer.on("open", (id) => {
  console.log("My peer ID is: " + id);
  peerIdDisplay.textContent = id;
});
// Lấy tham chiếu đến các video element
const myVideo = document.getElementById("my-video");
const peerVideo = document.getElementById("peer-video");
const peerIdDisplay = document.getElementById("peer-id-display");

// Tham chiếu đến các phần tử cho hộp xác nhận
const incomingCallContainer = document.getElementById("incoming-call");
const acceptCallButton = document.getElementById("accept-call-button");
const rejectCallButton = document.getElementById("reject-call-button");

let currentCall = null;
let incomingCall = null;

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    myVideo.srcObject = stream;

    // Khi nhận cuộc gọi từ đối phương
    peer.on("call", (call) => {
      incomingCall = call;
      incomingCallContainer.style.display = "block";

      acceptCallButton.addEventListener("click", () => {
        incomingCallContainer.style.display = "none";
        call.answer(stream); // Trả lời cuộc gọi

        call.on("stream", (remoteStream) => {
          peerVideo.srcObject = remoteStream; // Hiển thị video của đối phương
          document.getElementById("remote-peer-id").textContent = call.peer; // Hiển thị ID của đối phương
        });

        currentCall = call;

        call.on("close", () => {
          stopVideo(peerVideo);
          document.getElementById("remote-peer-id").textContent = ""; // Xóa ID của đối phương
          alert("Call ended by the peer.");
        });
      });

      rejectCallButton.addEventListener("click", () => {
        incomingCallContainer.style.display = "none";
        call.close();
        alert("You have rejected the call.");
      });
    });

    // Thực hiện cuộc gọi đến peer ID khác
    document.getElementById("call-button").addEventListener("click", () => {
      const peerId = document.getElementById("peer-id").value;
      if (peerId) {
        const call = peer.call(peerId, stream); // Gọi đến peer ID

        call.on("stream", (remoteStream) => {
          peerVideo.srcObject = remoteStream; // Hiển thị video của đối phương
          document.getElementById("remote-peer-id").textContent = call.peer; // Hiển thị ID của đối phương
        });

        currentCall = call;

        call.on("close", () => {
          stopVideo(peerVideo);
          document.getElementById("remote-peer-id").textContent = ""; // Xóa ID của đối phương
          alert("Call ended by the peer.");
        });
      }
    });

    document.getElementById("end-call-button").addEventListener("click", () => {
      if (currentCall) {
        currentCall.close();
        stopVideo(peerVideo);
        currentCall = null;
      }
    });
  })
  .catch((error) => {
    console.error("Error accessing media devices.", error);
  });

// Hàm để dừng và xóa video stream
function stopVideo(videoElement) {
  if (videoElement.srcObject) {
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();

    // Dừng tất cả các track (video và audio)
    tracks.forEach((track) => track.stop());

    // Xóa srcObject để dừng phát video
    videoElement.srcObject = null;
  }
}
