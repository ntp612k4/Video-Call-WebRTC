// Tạo peer object
const peer = new Peer();

// Lấy tham chiếu đến các video element
const myVideo = document.getElementById("my-video");
const peerVideo = document.getElementById("peer-video");

// Tham chiếu đến phần tử hiển thị Peer ID
const peerIdDisplay = document.getElementById("peer-id-display");

// Tham chiếu đến các phần tử cho hộp xác nhận
const incomingCallContainer = document.getElementById("incoming-call");
const acceptCallButton = document.getElementById("accept-call-button");
const rejectCallButton = document.getElementById("reject-call-button");

// Biến để lưu trữ thông tin cuộc gọi hiện tại
let currentCall = null;
let incomingCall = null; // Lưu trữ cuộc gọi đến

// Lấy media stream (audio/video) của người dùng
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    // Hiển thị video của người dùng
    myVideo.srcObject = stream;

    // Khi peer nhận cuộc gọi, hiển thị hộp thoại xác nhận
    peer.on("call", (call) => {
      incomingCall = call; // Lưu lại cuộc gọi đến
      incomingCallContainer.style.display = "block"; // Hiển thị hộp xác nhận

      // Xử lý khi người dùng bấm "Tham gia"
      acceptCallButton.addEventListener("click", () => {
        incomingCallContainer.style.display = "none"; // Ẩn hộp xác nhận
        call.answer(stream); // Trả lời cuộc gọi và gửi stream của mình
        call.on("stream", (remoteStream) => {
          // Hiển thị video của peer
          peerVideo.srcObject = remoteStream;
        });
        currentCall = call; // Lưu cuộc gọi hiện tại

        // Lắng nghe sự kiện kết thúc cuộc gọi
        call.on("close", () => {
          stopVideo(peerVideo); // Dừng video khi cuộc gọi kết thúc
          alert("Call ended by the peer.");
        });
      });

      // Xử lý khi người dùng bấm "Không tham gia"
      rejectCallButton.addEventListener("click", () => {
        incomingCallContainer.style.display = "none"; // Ẩn hộp xác nhận
        call.close(); // Từ chối cuộc gọi
        alert("You have rejected the call.");
      });
    });

    // Thực hiện cuộc gọi
    document.getElementById("call-button").addEventListener("click", () => {
      const peerId = document.getElementById("peer-id").value;
      if (peerId) {
        const call = peer.call(peerId, stream); // Gọi tới peer ID nhập vào
        call.on("stream", (remoteStream) => {
          // Hiển thị video của peer
          peerVideo.srcObject = remoteStream;
        });

        currentCall = call; // Lưu cuộc gọi hiện tại

        // Lắng nghe sự kiện kết thúc cuộc gọi
        call.on("close", () => {
          stopVideo(peerVideo); // Dừng video khi cuộc gọi kết thúc
          alert("Call ended by the peer.");
        });
      }
    });

    // Kết thúc cuộc gọi
    document.getElementById("end-call-button").addEventListener("click", () => {
      if (currentCall) {
        currentCall.close(); // Ngắt kết nối cuộc gọi
        stopVideo(peerVideo); // Dừng video của peer
        currentCall = null;
      }
    });
  })
  .catch((error) => {
    console.error("Error accessing media devices.", error);
  });

// Lắng nghe sự kiện khi kết nối thành công và hiển thị peer ID của mình
peer.on("open", (id) => {
  console.log("My peer ID is: " + id);
  // Hiển thị Peer ID lên màn hình
  peerIdDisplay.textContent = id;
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
