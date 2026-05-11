async function run() {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCm7YPImnLg74ISH7f8mXZKfcMieXy1i9M");
  const data = await res.json();
  const models = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
  console.log(models.map(m => m.name).join("\n"));
}
run();
