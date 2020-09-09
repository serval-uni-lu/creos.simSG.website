export function open(event: MouseEvent) {
    const source = event.target as HTMLElement;
    source.classList.toggle("active");
    const content = source.nextElementSibling as HTMLElement;

    if (content.style.maxHeight !== "0px") {
        content.style.maxHeight = "0px";
    } else {
        content.style.maxHeight =  content.scrollHeight + "px";
    }
}