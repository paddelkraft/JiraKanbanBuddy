//fake require js to make script movable between server and plugin
function require(ignored,func){
    func($);
}