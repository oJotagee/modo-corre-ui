// Código das funções de cada elemento no editor de plugins do Bubble.
// Cole o corpo de cada função na aba correspondente do elemento e troque
// COMPONENT pelo valor de "component" em elements.json (Button, Badge, Input, Pagination, Sidebar, UserMenu).

// function(instance, context)  →  "initialize"
function initialize(instance, context) {
  var start = function () {
    instance.data.mc = window.MCUI.bubbleElement(instance, "COMPONENT");
    if (instance.data.pending) instance.data.mc.update(instance.data.pending);
  };
  if (window.MCUI) start();
  else window.addEventListener("mcui:ready", start, { once: true });
}

// function(instance, properties, context)  →  "update"
function update(instance, properties, context) {
  if (instance.data.mc) instance.data.mc.update(properties);
  else instance.data.pending = properties;
}

// function(instance, context)  →  "reset" (só MC Input: marque "Add a reset function")
function reset(instance, context) {
  if (instance.data.mc) instance.data.mc.reset();
}

// function(instance, properties)  →  "preview" (opcional, só no editor)
function preview(instance, properties) {
  instance.canvas.css({ display: "flex", alignItems: "center", fontFamily: "Public Sans, sans-serif", fontSize: "13px", color: "#09123c" });
  instance.canvas.text(properties.label || properties.placeholder || "MC");
}
