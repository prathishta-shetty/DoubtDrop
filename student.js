  function joinClass(event) {
    event.preventDefault();
    const enteredCode = document.getElementById('classCode').value.trim();
    const storedCode = localStorage.getItem("generatedClassCode");

    if (enteredCode === storedCode) {
      window.location.href = "chat.html"; // ✅ Load chat page
    } else {
      alert("Invalid class code. Please try again.");
    }
  }