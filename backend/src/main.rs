mod api;
mod router;
mod types;

use actix_web::{App, HttpServer};
use std::fs;
use types::Node;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let file = fs::read_to_string("data/hotpoints.json").expect("Failed to read map.json");
    let map: Vec<Node> = serde_json::from_str(&file).expect("Invalid JSON");
    println!("running on port : 7979");
    HttpServer::new(move || {
        App::new()
            .app_data(actix_web::web::Data::new(map.clone()))
            .service(api::route)
    })
    .bind(("127.0.0.1", 7979))?
    .run()
    .await
}
