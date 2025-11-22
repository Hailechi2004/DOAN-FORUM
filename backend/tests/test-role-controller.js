// Test if roleController exports correctly
const roleController = require("./src/presentation/controllers/roleController");

console.log("roleController:", roleController);
console.log("roleController.getAll:", roleController.getAll);
console.log("roleController.getById:", roleController.getById);
console.log("roleController.create:", roleController.create);
console.log("roleController.update:", roleController.update);
console.log("roleController.delete:", roleController.delete);

if (roleController && roleController.getAll) {
  console.log("✅ roleController exported correctly");
} else {
  console.log("❌ roleController export failed");
}
