use crate::router::find_path;
use crate::types::Node;
use actix_web::{HttpResponse, Responder, get, web};

#[get("/route")]
pub async fn route(
    data: web::Data<Vec<Node>>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> impl Responder {
    let id_from = match query.get("id_from").and_then(|v| v.parse::<usize>().ok()) {
        Some(id) => id,
        None => return HttpResponse::BadRequest().body("Invalid or missing 'id_from'"),
    };

    let id_to = match query.get("id_to").and_then(|v| v.parse::<usize>().ok()) {
        Some(id) => id,
        None => return HttpResponse::BadRequest().body("Invalid or missing 'id_to'"),
    };

    let start_exists = data.iter().any(|n| n.id == id_from);
    let end_exists = data.iter().any(|n| n.id == id_to);

    if !start_exists || !end_exists {
        return HttpResponse::BadRequest().body("Start or end node ID not found in map");
    }

    let steps = find_path(&data, id_from, id_to);
    HttpResponse::Ok().json(steps)
}
