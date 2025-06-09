use crate::types::Node;
use std::fs::read_to_string;

pub fn load_map(file: &str) -> Vec<Node> {
    let data = read_to_string(file).expect("Unable to read file");
    serde_json::from_str(&data).expect("JSON parsing failed")
}
